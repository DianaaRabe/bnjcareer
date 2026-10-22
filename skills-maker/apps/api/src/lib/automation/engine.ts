// ─────────────────────────────────────────────────────────────────────────────
// Application engine.
//
// The ordered pipeline of skill §6, and the security gate of this phase:
//
//   discovery → normalization → canonicalization → deduplication
//            → matching → eligibility → already-applied → preparation
//
// It stops at preparation. There is no code path from here to an email provider:
// a prepared application is a row awaiting approval or the (later) send phase, and
// nothing in this module can reach Brevo, Gmail or any mailbox. That is deliberate
// — the gate must be provably closed, not merely documented.
//
// Every external effect is injected. The default wiring uses the real providers,
// the real LLM matcher and the real contact chain; tests substitute them, which is
// what makes the ten required scenarios (isolation, duplication, limits, timeout…)
// checkable without a database or network.
// ─────────────────────────────────────────────────────────────────────────────

import type { Profile } from '@prisma/client'
import type { Context } from '@/context.js'
import { mapBounded } from '@/lib/enrichment/concurrency.js'
import { resolveJobContact, type ContactResolution } from '@/lib/enrichment/resolveContact.js'
import { canonicalJobKey, dedupeJobs } from '@/lib/jobs/canonical.js'
import { getConfiguredProviders } from '@/lib/jobs/index.js'
import { CONTRACT_TYPE, type JobProvider, type JobSearchOutcome, type JobSearchQuery, type NormalizedJob } from '@/lib/jobs/types.js'
import { scoreJobOffer } from '@/graphql/modules/matching/matchingService.js'
import {
  buildTemplateCoverLetter,
  generateCoverLetter,
  TEMPLATE_COVER_LETTER_MODEL,
  type CoverLetterContext,
  type GeneratedCoverLetter,
  type LetterLanguage,
} from './coverLetter.js'
import { MATCH_PACING_MS, resolveAutomationSettings, type AutomationSettingsResolved } from './constants.js'
import { evaluateJobEligibility, isValidRecipient, remainingBudget } from './eligibility.js'
import { createPrismaAutomationStore, type AutomationStore } from './store.js'
import type {
  CanonicalJob,
  MatchedJob,
  PipelineOutcome,
  PreparedApplication,
  SkippedJob,
  SourceFailure,
} from './types.js'

export interface CvContext {
  extractedData: unknown
  profile: Profile | null
}

/** How many providers we hit at once — bounded so one slow source cannot stall the run. */
const PROVIDER_CONCURRENCY = 4
const DEFAULT_DISCOVERY_LIMIT = 40

const VALID_CONTRACT_TYPES = new Set<string>(Object.values(CONTRACT_TYPE))

export interface EngineDependencies {
  store: AutomationStore
  providers: JobProvider[]
  search?: (provider: JobProvider, query: JobSearchQuery) => Promise<JobSearchOutcome>
  /** Returns the match score, or null when the model could not produce a usable one. */
  match?: (job: CanonicalJob, cv: CvContext) => Promise<number | null>
  resolveContact?: (job: CanonicalJob) => Promise<ContactResolution>
  generateLetter?: (context: CoverLetterContext, job: CanonicalJob) => Promise<GeneratedCoverLetter>
  now?: () => Date
  runId?: string | null
  /**
   * Awaited once before every LLM call (matching, then each letter) so a burst of jobs does not
   * trip the free providers' rate limits all at once. Defaults to a short {@link MATCH_PACING_MS}
   * sleep; tests inject a no-op so the suite never actually waits.
   */
  pacer?: () => Promise<void>
  /**
   * Called a handful of times across the run so a supervising worker can refresh its run
   * heartbeat; a slow pipeline then stays "live" and is not reclaimed as stale. A failure here
   * never aborts the run — observability must not break the work it observes.
   */
  heartbeat?: () => Promise<void> | void
}

export interface RunEngineInput {
  candidateId: string
  settings: AutomationSettingsResolved
  cv: CvContext
  discoveryLimit?: number
  language?: LetterLanguage
}

/** UTC midnight — the daily ceiling is a calendar day, evaluated on the server's clock. */
export function startOfDayUtc(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function describeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`.slice(0, 200)
  return String(error).slice(0, 200)
}

/** A cancellable-free delay used by the default pacer. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function toCanonical(job: NormalizedJob, discoveredAt: string): CanonicalJob {
  return { ...job, canonicalKey: canonicalJobKey(job), discoveredAt }
}

/**
 * Builds a provider query from the candidate's filters, dropping any filter the source cannot
 * honour rather than pretending to apply it (same rule as the candidate-facing search).
 */
export function buildSearchQuery(
  provider: JobProvider,
  settings: AutomationSettingsResolved,
  limit: number,
): JobSearchQuery {
  const supports = (kind: (typeof provider.supportedFilters)[number]) =>
    provider.supportedFilters.includes(kind)
  const contractTypes = settings.contractTypes.filter((type) => VALID_CONTRACT_TYPES.has(type))

  return {
    keywords: settings.keywords.join(' ').trim() || undefined,
    location: settings.locations[0]?.trim() || undefined,
    limit,
    contractTypes: supports('CONTRACT_TYPE') && contractTypes.length > 0 ? (contractTypes as never) : undefined,
  }
}

/**
 * Runs the full pipeline for one candidate. Never throws for a single source or a single job:
 * a provider outage or a malformed LLM answer is recorded and the run continues (skill §26).
 */
export async function runApplicationPipeline(
  input: RunEngineInput,
  deps: EngineDependencies,
): Promise<PipelineOutcome> {
  const { candidateId, settings, cv } = input
  const now = deps.now ?? (() => new Date())
  const search = deps.search ?? ((provider, query) => provider.search(query))
  const resolveContact =
    deps.resolveContact ??
    ((job: CanonicalJob) =>
      resolveJobContact({
        companyName: job.company,
        companyWebsite: job.companyWebsite ?? null,
        description: job.description,
      }))
  const generateLetter = deps.generateLetter ?? generateCoverLetter
  const pace = deps.pacer ?? (() => sleep(MATCH_PACING_MS))
  const match =
    deps.match ??
    (async (job: CanonicalJob, context: CvContext) => {
      const result = await scoreJobOffer(context.extractedData, {
        jobTitle: job.title,
        company: job.company,
        description: job.description,
      })
      return result.score
    })

  // Best-effort heartbeat: swallow its own failure so a flaky write never fails the run.
  const beat = async () => {
    if (!deps.heartbeat) return
    try {
      await deps.heartbeat()
    } catch {
      /* observability only */
    }
  }

  const empty: PipelineOutcome = {
    enabled: false,
    discovered: [],
    deduplicated: [],
    duplicatesRemoved: 0,
    matched: [],
    prepared: [],
    skipped: [],
    failures: [],
  }

  // Consent gate first: a disabled candidate causes no discovery call at all.
  if (!settings.enabled || deps.providers.length === 0) return empty

  const skipped: SkippedJob[] = []
  const failures: SourceFailure[] = []
  const discoveredAt = now().toISOString()
  const discoveryLimit = input.discoveryLimit ?? DEFAULT_DISCOVERY_LIMIT

  // ── Discovery + normalization ─────────────────────────────────────────────
  const results = await mapBounded(deps.providers, PROVIDER_CONCURRENCY, async (provider) => {
    try {
      const outcome = await search(provider, buildSearchQuery(provider, settings, discoveryLimit))
      return { provider, jobs: outcome.jobs }
    } catch (error) {
      return { provider, jobs: [] as NormalizedJob[], failure: describeError(error) }
    }
  })

  const discovered: CanonicalJob[] = []
  for (const result of results) {
    if (result.failure) failures.push({ source: result.provider.id, detail: result.failure })
    for (const job of result.jobs) discovered.push(toCanonical(job, discoveredAt))
  }

  await beat()

  // ── Canonicalization + deduplication ──────────────────────────────────────
  const { jobs: deduplicated, duplicatesRemoved } = dedupeJobs(discovered)

  // ── Already-applied ───────────────────────────────────────────────────────
  // Evaluated before matching on purpose: it is a free, indexed lookup, and paying for an
  // LLM score on a vacancy the candidate already applied to is pure waste. The same gate is
  // also enforced again by the unique constraint at write time, so a race cannot slip through.
  const applied = await deps.store.findApplied(
    candidateId,
    deduplicated.map((job) => job.canonicalKey),
  )
  const fresh: CanonicalJob[] = []
  for (const job of deduplicated) {
    if (applied.has(job.canonicalKey)) skipped.push({ job, reason: 'ALREADY_APPLIED' })
    else fresh.push(job)
  }

  // ── Matching (LLM, sequential to respect provider quotas) ─────────────────
  const matched: MatchedJob[] = []
  for (const job of fresh) {
    try {
      await pace()
      const score = await match(job, cv)
      if (score == null) {
        skipped.push({ job, reason: 'REQUIRES_REVIEW', detail: 'matching_failed' })
        continue
      }
      matched.push({ job, score })
    } catch (error) {
      failures.push({ source: `matching:${job.source}`, detail: describeError(error) })
      skipped.push({ job, reason: 'REQUIRES_REVIEW', detail: 'matching_failed' })
    }
  }

  await beat()

  // ── Eligibility (deterministic, post-AI) ──────────────────────────────────
  const eligible: MatchedJob[] = []
  for (const entry of matched) {
    const verdict = evaluateJobEligibility({
      job: entry.job,
      matchScore: entry.score,
      settings,
      alreadyApplied: false,
    })
    if (verdict.eligible) eligible.push(entry)
    else skipped.push({ job: entry.job, reason: verdict.skipReason ?? 'SKIPPED', detail: verdict.detail })
  }

  // Best matches first, so a limited budget is spent where it matters. The key breaks ties
  // deterministically — two runs over the same data prepare the same jobs.
  eligible.sort((a, b) => b.score - a.score || a.job.canonicalKey.localeCompare(b.job.canonicalKey))

  // ── Budget ────────────────────────────────────────────────────────────────
  const sentToday = await deps.store.countPreparedSince(candidateId, startOfDayUtc(now()))
  const budget = Math.min(remainingBudget({ sentThisRun: 0, sentToday }, settings), eligible.length)

  await beat()

  const prepared: PreparedApplication[] = []
  const language = input.language ?? 'fr'

  for (const entry of eligible) {
    if (prepared.length >= budget) {
      skipped.push({ job: entry.job, reason: 'SKIPPED', detail: 'budget' })
      continue
    }

    try {
      const outcome = await prepareOne(entry, {
        candidateId,
        settings,
        cv,
        language,
        runId: deps.runId ?? null,
        resolveContact,
        generateLetter,
        pace,
        store: deps.store,
      })
      if ('prepared' in outcome) prepared.push(outcome.prepared)
      else skipped.push(outcome.skipped)
    } catch (error) {
      failures.push({ source: `prepare:${entry.job.source}`, detail: describeError(error) })
      skipped.push({ job: entry.job, reason: 'REQUIRES_REVIEW', detail: 'prepare_failed' })
    }
  }

  return {
    enabled: true,
    discovered,
    deduplicated,
    duplicatesRemoved,
    matched,
    prepared,
    skipped,
    failures,
  }
}

/** A discriminated result, so the caller reports the exact reason a job was not prepared. */
type PrepareOutcome = { prepared: PreparedApplication } | { skipped: SkippedJob }

async function prepareOne(
  entry: MatchedJob,
  deps: {
    candidateId: string
    settings: AutomationSettingsResolved
    cv: CvContext
    language: LetterLanguage
    runId: string | null
    resolveContact: (job: CanonicalJob) => Promise<ContactResolution>
    generateLetter: (context: CoverLetterContext, job: CanonicalJob) => Promise<GeneratedCoverLetter>
    pace: () => Promise<void>
    store: AutomationStore
  },
): Promise<PrepareOutcome> {
  const { job } = entry

  // ── Contact resolution ────────────────────────────────────────────────────
  // Continuity (skill §26): preparation never dead-ends on a missing contact. A verified
  // address is sendable; a pattern guess, or no address at all, prepares the application but
  // flags it for review so it is never sent blind (skill §8) — the candidate completes it.
  const resolution = await deps.resolveContact(job)
  const verified = resolution.verified.find((candidate) => isValidRecipient(candidate.email)) ?? null

  let contact = verified
  let needsReview = false

  if (!contact) {
    // A pattern guess is never auto-sent (skill §8). We still attach it so the candidate sees a
    // ready-to-use address on review, regardless of approval mode — but the row is flagged
    // `needsReview`, and under automatic mode its stage stays PREPARING (not sendable).
    const guess = resolution.guessed.find((candidate) => isValidRecipient(candidate.email)) ?? null
    if (guess) contact = guess
    needsReview = true
  }

  // ── Cover letter (never throws — falls back to the deterministic template) ──
  await deps.pace()
  let letter: GeneratedCoverLetter
  try {
    letter = await deps.generateLetter(
      { profile: deps.cv.profile, extractedData: deps.cv.extractedData, language: deps.language },
      job,
    )
  } catch {
    // Defensive: the sanctioned generator already falls back internally, but a substitute
    // injected via deps may still throw. Preparation must continue with a usable letter.
    letter = {
      content: buildTemplateCoverLetter(
        { profile: deps.cv.profile, extractedData: deps.cv.extractedData, language: deps.language },
        job,
      ),
      model: TEMPLATE_COVER_LETTER_MODEL,
      degraded: true,
    }
  }
  // A template/degraded letter is generic — route it to review so the candidate refines it.
  if (letter.degraded) needsReview = true

  // ── Preparation (a row awaiting approval or the send phase — never a send) ─
  const stage = deps.settings.approvalMode ? 'READY_TO_SEND' : 'PREPARING'
  const saved = await deps.store.savePrepared({
    candidateId: deps.candidateId,
    job,
    matchScore: entry.score,
    contact,
    coverLetter: letter.content,
    coverLetterModel: letter.model,
    stage,
    runId: deps.runId,
  })

  if (!saved.created) {
    // Lost a race with a concurrent run: the vacancy is already applied to.
    return { skipped: { job, reason: 'ALREADY_APPLIED' } }
  }

  if (contact) {
    await deps.store.saveContact(saved.jobOfferId, contact)
  }
  await deps.store.recordEvent(saved.applicationId, 'APPLICATION_PREPARED', {
    stage,
    matchScore: entry.score,
    contactSource: contact?.source ?? 'NONE',
    contactConfidence: contact?.confidence ?? 'NONE',
    needsReview,
    model: letter.model,
  })

  return {
    prepared: {
      job,
      matchScore: entry.score,
      coverLetter: letter.content,
      coverLetterModel: letter.model,
      contact,
      needsReview,
    },
  }
}

/** What a worker needs back from one candidate's run: the outcome and the resolved settings. */
export interface CandidateRunContext {
  outcome: PipelineOutcome
  settings: AutomationSettingsResolved
}

export interface RunAutomationOptions {
  /** Links the run's audit events to its {@link AutomationRun} row. */
  runId?: string | null
  /** Forwarded to the pipeline so the supervising worker can refresh its heartbeat. */
  heartbeat?: () => Promise<void> | void
}

/**
 * Real wiring for the worker: loads the candidate's settings and CV, and runs the pipeline
 * against the live providers and database. Still stops at preparation — no send. Returns the
 * resolved settings too, so the scheduler can reschedule by the candidate's frequency.
 */
export async function runAutomationForCandidate(
  ctx: Context,
  candidateId: string,
  options: RunAutomationOptions = {},
): Promise<CandidateRunContext> {
  const [settingsRow, cv, profile] = await Promise.all([
    ctx.prisma.candidateAutomationSettings.findUnique({ where: { candidateId } }),
    ctx.prisma.cv.findFirst({ where: { userId: candidateId }, orderBy: { createdAt: 'desc' } }),
    ctx.prisma.profile.findUnique({ where: { userId: candidateId } }),
  ])

  const settings = resolveAutomationSettings(settingsRow ?? null)

  const outcome = await runApplicationPipeline(
    {
      candidateId,
      settings,
      cv: { extractedData: cv?.extractedData ?? null, profile },
    },
    {
      store: createPrismaAutomationStore(ctx),
      providers: getConfiguredProviders(),
      runId: options.runId ?? null,
      heartbeat: options.heartbeat,
    },
  )

  return { outcome, settings }
}
