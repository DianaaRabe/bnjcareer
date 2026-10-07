// ─────────────────────────────────────────────────────────────────────────────
// Shared vocabulary of the application engine.
//
// The string unions mirror the Prisma enums (`AutomationStage`, `AutomationSkipReason`)
// without importing them, so the pure pipeline can be unit-tested without a generated
// client and so a stage/skip mismatch is a compile error at the boundary.
// ─────────────────────────────────────────────────────────────────────────────

import type { ContactCandidate } from '@/lib/enrichment/types.js'
import type { NormalizedJob } from '@/lib/jobs/types.js'

export type AutomationStageName =
  | 'DISCOVERED'
  | 'MATCHED'
  | 'ELIGIBLE'
  | 'PREPARING'
  | 'READY_TO_SEND'
  | 'SENDING'
  | 'SENT'
  | 'CANCELLED'

export type AutomationSkipReasonName =
  | 'MATCH_TOO_LOW'
  | 'ALREADY_APPLIED'
  | 'NO_CONTACT'
  | 'REQUIRES_REVIEW'
  | 'SKIPPED'
  | 'SEND_FAILED'

/** A discovered job that has been given a stable identity. */
export interface CanonicalJob extends NormalizedJob {
  canonicalKey: string
  /** ISO 8601, set by the engine when the job enters the pipeline. */
  discoveredAt: string
}

/** A canonical job that passed the LLM matcher. */
export interface MatchedJob {
  job: CanonicalJob
  score: number
}

/** Everything needed to write one automated application row. */
export interface PreparedApplication {
  job: CanonicalJob
  matchScore: number
  coverLetter: string
  coverLetterModel: string
  /** Verified address, or — under approval only — a pattern guess flagged as such. */
  contact: ContactCandidate
  /** True when the only contact found was a guess, so a human must confirm before sending. */
  needsReview: boolean
}

export interface SkippedJob {
  job: CanonicalJob
  reason: AutomationSkipReasonName
  /** Redacted explanation (provider name, missing filter). Never offer text or candidate data. */
  detail?: string
}

export interface SourceFailure {
  source: string
  /** Error name/message, truncated. Contains no candidate data. */
  detail: string
}

export type AutomationRunStatusName = 'RUNNING' | 'COMPLETED' | 'PARTIAL' | 'FAILED'

/** Result of the pure pipeline — no persistence, no email, no network beyond the injected deps. */
export interface PipelineOutcome {
  /** False when the candidate never enabled automation — the run then does nothing at all. */
  enabled: boolean
  discovered: CanonicalJob[]
  deduplicated: CanonicalJob[]
  duplicatesRemoved: number
  matched: MatchedJob[]
  prepared: PreparedApplication[]
  skipped: SkippedJob[]
  failures: SourceFailure[]
}
