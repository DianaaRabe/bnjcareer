// ─────────────────────────────────────────────────────────────────────────────
// Automation scheduler / worker (skill §17).
//
//   cron
//    ↓  findDueCandidates          — enabled candidates whose nextRunAt has passed
//    ↓  claimRun                    — create the AutomationRun row that IS the lock
//    ↓  runCandidate                — the Phase-3 pipeline (still stops at preparation)
//    ↓  completeRun + reschedule    — record stats, set the next due time
//
// Three invariants the skill demands (§17, §26, §12):
//   • One run per candidate at a time. The AutomationRun row doubles as the claim: a worker
//     that finds a live RUNNING row skips the candidate. A crashed worker's run is reclaimed
//     once its heartbeat goes stale, so a dead process cannot block a candidate forever.
//   • Partial-failure isolation. One candidate throwing never aborts the batch; one source
//     failing inside the pipeline downgrades the run to PARTIAL, it does not fail it.
//   • Idempotency is defence-in-depth. Even if two workers somehow both claimed (a race under
//     READ COMMITTED), the Application `@@unique([userId, jobOfferId])` constraint still makes a
//     duplicate application impossible — the run-level claim only saves wasted work.
//
// Every effect is injected through {@link SchedulerStore} and `runCandidate`, so the whole
// coordinator is unit-testable with in-memory fakes — no database, no cron, no clock.
// ─────────────────────────────────────────────────────────────────────────────

import type { AutomationFrequency } from '@prisma/client'
import type { Context } from '@/context.js'
import { RUN_STALE_AFTER_MS, nextRunAt } from './constants.js'
import { runAutomationForCandidate, type CandidateRunContext } from './engine.js'
import type { AutomationRunStatusName, PipelineOutcome, SourceFailure } from './types.js'

/** The counters an {@link AutomationRun} row records, derived purely from a pipeline outcome. */
export interface RunStats {
  jobsDiscovered: number
  jobsDeduplicated: number
  jobsMatched: number
  /** Applications prepared this run. Until the send phase lands, "prepared" is the real work done. */
  applicationsPrepared: number
  failures: number
}

export interface ClaimedRun {
  runId: string
}

export interface CompleteRunInput {
  status: AutomationRunStatusName
  stats: RunStats
  /** Per-source detail only — never candidate data or offer text (skill §27). */
  errorSummary?: SourceFailure[]
  completedAt: Date
}

/** Persistence port for the scheduler. The Prisma implementation is the only DB-aware piece. */
export interface SchedulerStore {
  /** Candidate ids whose automation is enabled and whose `nextRunAt` is at or before `now`. */
  findDueCandidates(now: Date, limit: number): Promise<string[]>
  /**
   * Atomically reclaim any stale RUNNING run for the candidate, then claim a fresh one — unless a
   * live (non-stale) RUNNING run already exists, in which case this returns null and the caller
   * skips the candidate.
   */
  claimRun(candidateId: string, now: Date, staleBefore: Date): Promise<ClaimedRun | null>
  /** Refresh the run heartbeat so a long pipeline is not mistaken for a dead worker. */
  heartbeat(runId: string, now: Date): Promise<void>
  completeRun(runId: string, input: CompleteRunInput): Promise<void>
  /** Set the candidate's next due time, or clear it (null) when automation is no longer enabled. */
  rescheduleCandidate(candidateId: string, next: Date | null): Promise<void>
}

export type CandidateDisposition = 'COMPLETED' | 'PARTIAL' | 'FAILED' | 'SKIPPED_LOCKED' | 'ERROR'

export interface CandidateResult {
  candidateId: string
  disposition: CandidateDisposition
  runId?: string
  stats?: RunStats
  /** Redacted error message when the whole candidate run threw (disposition ERROR). */
  error?: string
}

export interface SchedulerSummary {
  processed: number
  claimed: number
  skippedLocked: number
  results: CandidateResult[]
}

export interface SchedulerDeps {
  store: SchedulerStore
  /** Runs one candidate's pipeline. Injected so the coordinator is DB- and network-free in tests. */
  runCandidate: (candidateId: string, runId: string) => Promise<CandidateRunContext>
  now?: () => Date
  /** Upper bound on candidates processed per cron tick — bounds a single invocation's blast radius. */
  limit?: number
}

const DEFAULT_BATCH_LIMIT = 25

/** Pure projection of a pipeline outcome onto the run counters. */
export function statsFromOutcome(outcome: PipelineOutcome): RunStats {
  return {
    jobsDiscovered: outcome.discovered.length,
    jobsDeduplicated: outcome.deduplicated.length,
    jobsMatched: outcome.matched.length,
    applicationsPrepared: outcome.prepared.length,
    failures: outcome.failures.length,
  }
}

const ZERO_STATS: RunStats = {
  jobsDiscovered: 0,
  jobsDeduplicated: 0,
  jobsMatched: 0,
  applicationsPrepared: 0,
  failures: 0,
}

function describeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`.slice(0, 200)
  return String(error).slice(0, 200)
}

function dueNextRun(settings: { enabled: boolean; frequency: AutomationFrequency }, now: Date): Date | null {
  // A candidate who disabled automation mid-run has their schedule cleared, not advanced.
  return settings.enabled ? nextRunAt(settings.frequency, now) : null
}

/**
 * One cron tick. Finds due candidates, claims and runs each in isolation, records the run and sets
 * the next due time. Never throws for a single candidate — the batch always drains. The return
 * value is a redacted summary suitable for logging.
 */
export async function runDueAutomations(deps: SchedulerDeps): Promise<SchedulerSummary> {
  const now = deps.now ?? (() => new Date())
  const limit = deps.limit ?? DEFAULT_BATCH_LIMIT
  const startedAt = now()
  const staleBefore = new Date(startedAt.getTime() - RUN_STALE_AFTER_MS)

  const candidates = await deps.store.findDueCandidates(startedAt, limit)
  const results: CandidateResult[] = []
  let claimed = 0
  let skippedLocked = 0

  for (const candidateId of candidates) {
    try {
      const claim = await deps.store.claimRun(candidateId, now(), staleBefore)
      if (!claim) {
        skippedLocked += 1
        results.push({ candidateId, disposition: 'SKIPPED_LOCKED' })
        continue
      }
      claimed += 1
      results.push(await runClaimed(deps, candidateId, claim.runId, now))
    } catch (error) {
      // Isolation: a failure *outside* the pipeline (claim, reschedule, an unexpected throw) is
      // confined to this candidate so the rest of the batch still runs.
      results.push({ candidateId, disposition: 'ERROR', error: describeError(error) })
    }
  }

  return { processed: candidates.length, claimed, skippedLocked, results }
}

/** Runs a candidate whose run is already claimed, and always records a terminal run state. */
async function runClaimed(
  deps: SchedulerDeps,
  candidateId: string,
  runId: string,
  now: () => Date,
): Promise<CandidateResult> {
  try {
    const { outcome, settings } = await deps.runCandidate(candidateId, runId)
    const stats = statsFromOutcome(outcome)
    // A source failing inside the pipeline is a PARTIAL run, not a failed one (skill §26).
    const status: AutomationRunStatusName = outcome.failures.length > 0 ? 'PARTIAL' : 'COMPLETED'

    await deps.store.completeRun(runId, {
      status,
      stats,
      errorSummary: outcome.failures.length > 0 ? outcome.failures : undefined,
      completedAt: now(),
    })
    await deps.store.rescheduleCandidate(candidateId, dueNextRun(settings, now()))

    return { candidateId, runId, disposition: status, stats }
  } catch (error) {
    // The pipeline itself threw — mark the run FAILED, but still advance the schedule so one bad
    // run does not wedge the candidate. Rescheduling uses the default frequency since settings
    // may not have loaded; a disabled candidate will simply produce an empty next run.
    const detail = describeError(error)
    await deps.store.completeRun(runId, {
      status: 'FAILED',
      stats: ZERO_STATS,
      errorSummary: [{ source: 'pipeline', detail }],
      completedAt: now(),
    })
    await deps.store.rescheduleCandidate(candidateId, nextRunAt('WEEKLY', now()))
    return { candidateId, runId, disposition: 'FAILED', error: detail }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Prisma wiring.
// ─────────────────────────────────────────────────────────────────────────────

export function createPrismaSchedulerStore(ctx: Context): SchedulerStore {
  const prisma = ctx.prisma

  return {
    async findDueCandidates(now, limit) {
      const rows = await prisma.candidateAutomationSettings.findMany({
        where: { enabled: true, nextRunAt: { not: null, lte: now } },
        orderBy: { nextRunAt: 'asc' },
        take: limit,
        select: { candidateId: true },
      })
      return rows.map((row) => row.candidateId)
    },

    async claimRun(candidateId, now, staleBefore) {
      return prisma.$transaction(async (tx) => {
        // Reclaim a crashed worker's run: a RUNNING row whose heartbeat went stale is terminal.
        await tx.automationRun.updateMany({
          where: { candidateId, status: 'RUNNING', heartbeatAt: { lt: staleBefore } },
          data: {
            status: 'FAILED',
            completedAt: now,
            errorSummary: [{ source: 'worker', detail: 'reclaimed: stale heartbeat' }] as never,
          },
        })

        const live = await tx.automationRun.findFirst({
          where: { candidateId, status: 'RUNNING' },
          select: { id: true },
        })
        if (live) return null

        const created = await tx.automationRun.create({
          data: { candidateId, status: 'RUNNING', startedAt: now, heartbeatAt: now },
          select: { id: true },
        })
        return { runId: created.id }
      })
    },

    async heartbeat(runId, now) {
      await prisma.automationRun.update({ where: { id: runId }, data: { heartbeatAt: now } })
    },

    async completeRun(runId, input) {
      await prisma.automationRun.update({
        where: { id: runId },
        data: {
          status: input.status as never,
          completedAt: input.completedAt,
          jobsDiscovered: input.stats.jobsDiscovered,
          jobsDeduplicated: input.stats.jobsDeduplicated,
          jobsMatched: input.stats.jobsMatched,
          applicationsSent: input.stats.applicationsPrepared,
          failures: input.stats.failures,
          errorSummary: (input.errorSummary ?? undefined) as never,
        },
      })
    },

    async rescheduleCandidate(candidateId, next) {
      // updateMany, not update: a candidate without a settings row (deleted mid-batch) is a no-op
      // rather than a thrown "record not found".
      await prisma.candidateAutomationSettings.updateMany({
        where: { candidateId },
        data: { nextRunAt: next },
      })
    },
  }
}

/**
 * Production dependencies for {@link runDueAutomations}: the Prisma store plus a `runCandidate`
 * that drives the real pipeline and refreshes the run heartbeat as it progresses.
 */
export function createSchedulerDeps(ctx: Context, overrides?: Partial<SchedulerDeps>): SchedulerDeps {
  const store = overrides?.store ?? createPrismaSchedulerStore(ctx)
  return {
    store,
    runCandidate:
      overrides?.runCandidate ??
      ((candidateId, runId) =>
        runAutomationForCandidate(ctx, candidateId, {
          runId,
          heartbeat: () => store.heartbeat(runId, new Date()),
        })),
    now: overrides?.now,
    limit: overrides?.limit,
  }
}
