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
 * Remote vacancies satisfy any location filter: the candidate asked for an area, and a
 * remote role is reachable from it. Dropping them would hide exactly the offers a
 * location-constrained candidate benefits from most.
 */
export function matchesLocations(job: CanonicalJob, locations: readonly string[]): boolean {
  const wanted = locations.map((l) => normalizeText(l)).filter(Boolean)
  if (wanted.length === 0) return true
  if (job.isRemote) return true
  const haystack = normalizeText([job.location, job.title, job.description].join(' '))
  return wanted.some((location) => haystack.includes(location))
}

/**
 * Conservative on purpose: a vacancy that never states a contract type does not satisfy an
 * explicit request for CDI. Applying to the wrong contract is worse than skipping it.
 */
export function matchesContractTypes(job: CanonicalJob, contractTypes: readonly string[]): boolean {
  if (contractTypes.length === 0) return true
  const haystack = jobText(job)
  return contractTypes.some((type) =>
    (CONTRACT_LABELS[type] ?? [normalizeText(type)]).some((label) => haystack.includes(label)),
  )
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
