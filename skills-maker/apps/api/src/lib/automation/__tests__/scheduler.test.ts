import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { AUTOMATION_INTERVAL_MS, RUN_STALE_AFTER_MS } from '../constants.js'
import { runDueAutomations, statsFromOutcome, type SchedulerDeps, type SchedulerStore } from '../scheduler.js'
import { JOB_SOURCE } from '@/lib/jobs/types.js'
import type { ContactCandidate } from '@/lib/enrichment/types.js'
import type { AutomationSettingsResolved } from '../constants.js'
import type { CandidateRunContext } from '../engine.js'
import type { CanonicalJob, PipelineOutcome, PreparedApplication, SourceFailure } from '../types.js'

const NOW = new Date('2026-10-07T09:00:00.000Z')

const settings = (overrides: Partial<AutomationSettingsResolved> = {}): AutomationSettingsResolved => ({
  enabled: true,
  frequency: 'WEEKLY',
  maxApplicationsPerRun: 5,
  maxApplicationsPerDay: 10,
  minMatchScore: 65,
  approvalMode: true,
  keywords: [],
  locations: [],
  contractTypes: [],
  ...overrides,
})

const canonical = (key: string): CanonicalJob => ({
  id: `FRANCE_TRAVAIL:${key}`,
  canonicalKey: key,
  discoveredAt: NOW.toISOString(),
  source: JOB_SOURCE.franceTravail,
  title: 'Data Analyst',
  company: 'Acme',
  description: 'desc',
  location: 'Paris',
  applyUrl: `https://acme.fr/${key}`,
  postedAt: null,
  salary: null,
  tags: [],
  isRemote: false,
})

const contact = (email: string): ContactCandidate => ({
  email,
  contactName: null,
  source: 'OFFER',
  confidence: 'VERIFIED',
})

const prepared = (key: string): PreparedApplication => ({
  job: canonical(key),
  matchScore: 80,
  coverLetter: 'Bonjour',
  coverLetterModel: 'test',
  contact: contact('rh@acme.fr'),
  needsReview: false,
})

const outcome = (overrides: Partial<PipelineOutcome> = {}): PipelineOutcome => ({
  enabled: true,
  discovered: [canonical('a'), canonical('b')],
  deduplicated: [canonical('a'), canonical('b')],
  duplicatesRemoved: 0,
  matched: [{ job: canonical('a'), score: 80 }],
  prepared: [prepared('a')],
  skipped: [],
  failures: [],
  ...overrides,
})

interface CompletedCall {
  runId: string
  status: string
  errorSummary?: SourceFailure[]
  applicationsPrepared: number
}

/** In-memory scheduler store that records everything, with a scripted claim behaviour. */
function fakeStore(config: {
  due?: string[]
  /** Candidate ids for which claimRun returns null (a live run already holds the lock). */
  locked?: Set<string>
  /** Candidate ids for which claimRun itself throws. */
  claimThrows?: Set<string>
}): SchedulerStore & {
  completed: CompletedCall[]
  rescheduled: { candidateId: string; next: Date | null }[]
  claimArgs: { candidateId: string; now: Date; staleBefore: Date }[]
  limitSeen?: number
} {
  const completed: CompletedCall[] = []
  const rescheduled: { candidateId: string; next: Date | null }[] = []
  const claimArgs: { candidateId: string; now: Date; staleBefore: Date }[] = []
  let counter = 0
  const self = {
    completed,
    rescheduled,
    claimArgs,
    limitSeen: undefined as number | undefined,
    async findDueCandidates(_now: Date, limit: number) {
      self.limitSeen = limit
      return config.due ?? []
    },
    async claimRun(candidateId: string, now: Date, staleBefore: Date) {
      claimArgs.push({ candidateId, now, staleBefore })
      if (config.claimThrows?.has(candidateId)) throw new Error('claim exploded')
      if (config.locked?.has(candidateId)) return null
      counter += 1
      return { runId: `run-${candidateId}-${counter}` }
    },
    async heartbeat() {},
    async completeRun(runId: string, input: { status: string; errorSummary?: SourceFailure[]; stats: { applicationsPrepared: number } }) {
      completed.push({
        runId,
        status: input.status,
        errorSummary: input.errorSummary,
        applicationsPrepared: input.stats.applicationsPrepared,
      })
    },
    async rescheduleCandidate(candidateId: string, next: Date | null) {
      rescheduled.push({ candidateId, next })
    },
  }
  return self
}

const deps = (
  store: SchedulerStore,
  runCandidate: SchedulerDeps['runCandidate'],
  extra: Partial<SchedulerDeps> = {},
): SchedulerDeps => ({ store, runCandidate, now: () => NOW, ...extra })

const okRun =
  (o: PipelineOutcome = outcome(), s: AutomationSettingsResolved = settings()): SchedulerDeps['runCandidate'] =>
  async (): Promise<CandidateRunContext> => ({ outcome: o, settings: s })

describe('statsFromOutcome', () => {
  it('projects the outcome onto the run counters', () => {
    const stats = statsFromOutcome(
      outcome({ discovered: [canonical('a'), canonical('b'), canonical('c')], failures: [{ source: 'wttj', detail: 'x' }] }),
    )
    assert.equal(stats.jobsDiscovered, 3)
    assert.equal(stats.jobsDeduplicated, 2)
    assert.equal(stats.jobsMatched, 1)
    assert.equal(stats.applicationsPrepared, 1)
    assert.equal(stats.failures, 1)
  })
})

describe('runDueAutomations — happy path', () => {
  it('claims, runs, completes COMPLETED and reschedules by frequency', async () => {
    const store = fakeStore({ due: ['cand-1'] })
    const summary = await runDueAutomations(deps(store, okRun()))

    assert.equal(summary.processed, 1)
    assert.equal(summary.claimed, 1)
    assert.equal(summary.results[0].disposition, 'COMPLETED')
    assert.equal(store.completed[0].status, 'COMPLETED')
    assert.equal(store.completed[0].applicationsPrepared, 1)
    assert.equal(store.completed[0].errorSummary, undefined)
    // WEEKLY → nextRunAt = now + 7d
    assert.equal(store.rescheduled[0].next?.getTime(), NOW.getTime() + AUTOMATION_INTERVAL_MS.WEEKLY)
  })

  it('passes a stale-before cutoff of now - RUN_STALE_AFTER_MS to the claim', async () => {
    const store = fakeStore({ due: ['cand-1'] })
    await runDueAutomations(deps(store, okRun()))
    assert.equal(store.claimArgs[0].staleBefore.getTime(), NOW.getTime() - RUN_STALE_AFTER_MS)
  })

  it('reschedules a DAILY candidate one day out', async () => {
    const store = fakeStore({ due: ['cand-1'] })
    await runDueAutomations(deps(store, okRun(outcome(), settings({ frequency: 'DAILY' }))))
    assert.equal(store.rescheduled[0].next?.getTime(), NOW.getTime() + AUTOMATION_INTERVAL_MS.DAILY)
  })
})

describe('runDueAutomations — partial failure (skill §26)', () => {
  it('records PARTIAL and keeps the source detail when the pipeline reports failures', async () => {
    const store = fakeStore({ due: ['cand-1'] })
    const failing = outcome({ failures: [{ source: 'francetravail', detail: 'TimeoutError: timed out' }] })
    const summary = await runDueAutomations(deps(store, okRun(failing)))

    assert.equal(summary.results[0].disposition, 'PARTIAL')
    assert.equal(store.completed[0].status, 'PARTIAL')
    assert.deepEqual(store.completed[0].errorSummary, [{ source: 'francetravail', detail: 'TimeoutError: timed out' }])
    // A partial run still advances the schedule.
    assert.equal(store.rescheduled[0].next?.getTime(), NOW.getTime() + AUTOMATION_INTERVAL_MS.WEEKLY)
  })
})

describe('runDueAutomations — concurrency claim (skill §17)', () => {
  it('skips a candidate whose run is already locked and never runs its pipeline', async () => {
    const store = fakeStore({ due: ['cand-1'], locked: new Set(['cand-1']) })
    let ran = false
    const summary = await runDueAutomations(
      deps(store, async () => {
        ran = true
        return { outcome: outcome(), settings: settings() }
      }),
    )

    assert.equal(ran, false)
    assert.equal(summary.skippedLocked, 1)
    assert.equal(summary.claimed, 0)
    assert.equal(summary.results[0].disposition, 'SKIPPED_LOCKED')
    assert.equal(store.completed.length, 0)
    assert.equal(store.rescheduled.length, 0)
  })
})

describe('runDueAutomations — failure isolation', () => {
  it('a thrown pipeline marks that run FAILED but still advances its schedule', async () => {
    const store = fakeStore({ due: ['cand-1'] })
    const summary = await runDueAutomations(
      deps(store, async () => {
        throw new Error('groq exploded')
      }),
    )

    assert.equal(summary.results[0].disposition, 'FAILED')
    assert.equal(store.completed[0].status, 'FAILED')
    assert.equal(store.completed[0].applicationsPrepared, 0)
    assert.match(store.completed[0].errorSummary?.[0].detail ?? '', /groq exploded/)
    assert.equal(store.rescheduled.length, 1)
  })

  it('one candidate throwing does not abort the batch', async () => {
    const store = fakeStore({ due: ['cand-1', 'cand-2', 'cand-3'] })
    const summary = await runDueAutomations(
      deps(store, async (candidateId) => {
        if (candidateId === 'cand-2') throw new Error('boom')
        return { outcome: outcome(), settings: settings() }
      }),
    )

    assert.equal(summary.processed, 3)
    assert.equal(summary.results.map((r) => r.disposition).join(','), 'COMPLETED,FAILED,COMPLETED')
    // cand-1 and cand-3 still completed normally.
    assert.equal(store.completed.filter((c) => c.status === 'COMPLETED').length, 2)
  })

  it('a claim that throws is confined to its candidate (ERROR) and the batch continues', async () => {
    const store = fakeStore({ due: ['cand-1', 'cand-2'], claimThrows: new Set(['cand-1']) })
    const summary = await runDueAutomations(deps(store, okRun()))

    assert.equal(summary.results[0].disposition, 'ERROR')
    assert.match(summary.results[0].error ?? '', /claim exploded/)
    assert.equal(summary.results[1].disposition, 'COMPLETED')
  })
})

describe('runDueAutomations — scheduling edge cases', () => {
  it('clears nextRunAt (null) when the candidate disabled automation mid-run', async () => {
    const store = fakeStore({ due: ['cand-1'] })
    await runDueAutomations(deps(store, okRun(outcome({ enabled: false, prepared: [], matched: [] }), settings({ enabled: false }))))
    assert.equal(store.rescheduled[0].next, null)
  })

  it('forwards the batch limit to the store', async () => {
    const store = fakeStore({ due: [] })
    await runDueAutomations(deps(store, okRun(), { limit: 7 }))
    assert.equal(store.limitSeen, 7)
  })

  it('does nothing when no candidate is due', async () => {
    const store = fakeStore({ due: [] })
    const summary = await runDueAutomations(deps(store, okRun()))
    assert.equal(summary.processed, 0)
    assert.equal(summary.claimed, 0)
    assert.equal(store.completed.length, 0)
  })
})
