// ─────────────────────────────────────────────────────────────────────────────
// Deterministic eligibility.
//
// These rules run *after* the LLM matcher and never inside it. The model scores;
// the business rules decide (skill §5: "never let an LLM directly execute an
// application", "apply deterministic business rules after AI scoring"). Everything
// here is pure and synchronous, which is what makes the gate testable.
// ─────────────────────────────────────────────────────────────────────────────

import { isApplicationEmail } from '@/lib/enrichment/emailAddresses.js'
import { normalizeText } from '@/lib/jobs/canonical.js'
import type { AutomationSettingsResolved } from './constants.js'
import type { AutomationSkipReasonName, CanonicalJob } from './types.js'

/**
 * Contract-type vocabulary. The candidate picks our enum, the offer carries free text
 * in one of two languages, so the comparison happens through labels rather than codes.
 */
const CONTRACT_LABELS: Record<string, string[]> = {
  PERMANENT: ['cdi', 'permanent', 'indetermine', 'indefinite'],
  FIXED_TERM: ['cdd', 'fixed term', 'fixed-term', 'determine'],
  APPRENTICESHIP: ['apprentissage', 'alternance', 'apprentice', 'work study', 'work-study'],
  INTERNSHIP: ['stage', 'internship', 'stagiaire'],
  TEMPORARY: ['interim', 'temporary', 'mission'],
  FREELANCE: ['freelance', 'independant', 'indépendant', 'contractor'],
  SEASONAL: ['saisonnier', 'seasonal'],
}

/** Everything an offer says about itself, normalised once per check. */
function jobText(job: CanonicalJob): string {
  return normalizeText([job.title, job.company, job.location, ...job.tags, job.description].join(' '))
}

/** Empty filter means "no constraint", never "match nothing". */
export function matchesKeywords(job: CanonicalJob, keywords: readonly string[]): boolean {
  const wanted = keywords.map((k) => normalizeText(k)).filter(Boolean)
  if (wanted.length === 0) return true
  const haystack = jobText(job)
  return wanted.some((keyword) => haystack.includes(keyword))
}

/**
 * Location tokens that express "I want to work remotely" rather than a geographic area.
 * Normalised (accent-stripped, lowercased) so `télétravail` and `distanciel` match too.
 */
const REMOTE_LOCATION_TOKENS = ['remote', 'teletravail', 'télétravail', 'distanciel', 'anywhere', 'partout'].map(
  (t) => normalizeText(t),
)

/** Does the offer text advertise remote work, even when the structured `isRemote` flag is unset? */
function textLooksRemote(job: CanonicalJob): boolean {
  const haystack = normalizeText([job.location, job.title, job.description, ...job.tags].join(' '))
  return REMOTE_LOCATION_TOKENS.some((token) => haystack.includes(token))
}

/**
 * Remote vacancies satisfy any location filter: the candidate asked for an area, and a
 * remote role is reachable from it. Dropping them would hide exactly the offers a
 * location-constrained candidate benefits from most.
 *
 * Symmetrically, a candidate whose location filter *is itself* a remote keyword (e.g.
 * "Remote", "télétravail") is asking for remote work — so any offer flagged remote or whose
 * text advertises remote satisfies it, regardless of the geographic words in the posting.
 */
export function matchesLocations(job: CanonicalJob, locations: readonly string[]): boolean {
  const wanted = locations.map((l) => normalizeText(l)).filter(Boolean)
  if (wanted.length === 0) return true
  if (job.isRemote) return true

  const wantsRemote = wanted.some((location) => REMOTE_LOCATION_TOKENS.includes(location))
  if (wantsRemote && textLooksRemote(job)) return true

  const haystack = normalizeText([job.location, job.title, job.description].join(' '))
  return wanted.some((location) => haystack.includes(location))
}

/**
 * Maps a stored contract-type value onto a {@link CONTRACT_LABELS} key. The UI stores free-form
 * strings — sometimes the enum value (`FREELANCE`), sometimes the display label (`Freelance`,
 * `Fixed term`) — so we upper-case and collapse separators to reach the canonical key. Without
 * this, a label like `"Freelance"` silently misses the `FREELANCE` key and its synonym list
 * (independant, mission, contractor…) is never consulted.
 */
function contractLabelsFor(type: string): string[] {
  const key = type.trim().toUpperCase().replace(/[\s-]+/g, '_')
  return CONTRACT_LABELS[key] ?? [normalizeText(type)]
}

/**
 * Conservative on purpose: a vacancy that never states a contract type does not satisfy an
 * explicit request for CDI. Applying to the wrong contract is worse than skipping it.
 */
export function matchesContractTypes(job: CanonicalJob, contractTypes: readonly string[]): boolean {
  if (contractTypes.length === 0) return true
  const haystack = jobText(job)
  return contractTypes.some((type) => contractLabelsFor(type).some((label) => haystack.includes(label)))
}

/** An address a real application may be sent to. Reuses the enrichment reject-list. */
export function isValidRecipient(email: string | null | undefined): email is string {
  return typeof email === 'string' && isApplicationEmail(email)
}

export interface BudgetCounts {
  /** Automated applications already prepared or sent during this run. */
  sentThisRun: number
  /** Automated applications this candidate already had today (any run). */
  sentToday: number
}

/**
 * How many more applications this run may still prepare. The tighter of the run and daily
 * ceilings wins, and it never goes negative — an over-quota day simply prepares nothing.
 */
export function remainingBudget(counts: BudgetCounts, settings: AutomationSettingsResolved): number {
  const byRun = settings.maxApplicationsPerRun - counts.sentThisRun
  const byDay = settings.maxApplicationsPerDay - counts.sentToday
  return Math.max(0, Math.min(byRun, byDay))
}

export interface EligibilityVerdict {
  eligible: boolean
  skipReason: AutomationSkipReasonName | null
  detail?: string
}

/**
 * The deterministic gate. Order matters for reporting: the most specific and least
 * expensive reason wins, so an already-applied low-scoring job is reported as
 * already-applied rather than as a score problem.
 */
export function evaluateJobEligibility(input: {
  job: CanonicalJob
  matchScore: number | null
  settings: AutomationSettingsResolved
  alreadyApplied: boolean
}): EligibilityVerdict {
  const { job, matchScore, settings, alreadyApplied } = input

  if (alreadyApplied) return { eligible: false, skipReason: 'ALREADY_APPLIED' }

  const score = matchScore ?? 0
  if (score < settings.minMatchScore) {
    return { eligible: false, skipReason: 'MATCH_TOO_LOW', detail: `score=${score} min=${settings.minMatchScore}` }
  }

  if (!matchesKeywords(job, settings.keywords)) {
    return { eligible: false, skipReason: 'SKIPPED', detail: 'keywords' }
  }
  if (!matchesLocations(job, settings.locations)) {
    return { eligible: false, skipReason: 'SKIPPED', detail: 'locations' }
  }
  if (!matchesContractTypes(job, settings.contractTypes)) {
    return { eligible: false, skipReason: 'SKIPPED', detail: 'contractTypes' }
  }

  return { eligible: true, skipReason: null }
}

export const __testing = { CONTRACT_LABELS }
