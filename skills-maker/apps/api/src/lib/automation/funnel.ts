// ─────────────────────────────────────────────────────────────────────────────
// Run funnel diagnostics.
//
// A run that reports "92 matched · 0 prepared · COMPLETED" is not an error — every
// job was scored, then every one was dropped by a deterministic gate (score below
// the threshold, a filter that excluded it, or the daily/run budget). The counters
// persisted on the run row cannot say *which* gate, so the run looks like a silent
// black hole.
//
// This module turns a {@link PipelineOutcome} into a compact, fully redacted summary
// — counts per skip reason and the score range — so one log line tells an operator
// exactly where the funnel collapsed. It is pure: it carries no offer text and no
// candidate data (skill §27), only the reason/detail strings the pipeline already
// classified.
// ─────────────────────────────────────────────────────────────────────────────

import type { PipelineOutcome } from './types.js'

export interface FunnelDiagnostics {
  discovered: number
  deduplicated: number
  duplicatesRemoved: number
  matched: number
  prepared: number
  /** False when the candidate has no extracted CV data — a common cause of all-zero scores. */
  cvPresent: boolean
  /** Match-score range across the matched jobs, and how many fell under the eligibility floor. */
  scores: { min: number | null; max: number | null; belowMin: number }
  /** Count of dropped jobs keyed by `REASON` or `REASON:detail` (both already redacted). */
  skips: Record<string, number>
}

export function summarizeFunnel(
  outcome: PipelineOutcome,
  minMatchScore: number,
  cvPresent: boolean,
): FunnelDiagnostics {
  let min: number | null = null
  let max: number | null = null
  let belowMin = 0
  for (const { score } of outcome.matched) {
    if (min === null || score < min) min = score
    if (max === null || score > max) max = score
    if (score < minMatchScore) belowMin += 1
  }

  const skips: Record<string, number> = {}
  for (const skip of outcome.skipped) {
    const key = skip.detail ? `${skip.reason}:${skip.detail}` : skip.reason
    skips[key] = (skips[key] ?? 0) + 1
  }

  return {
    discovered: outcome.discovered.length,
    deduplicated: outcome.deduplicated.length,
    duplicatesRemoved: outcome.duplicatesRemoved,
    matched: outcome.matched.length,
    prepared: outcome.prepared.length,
    cvPresent,
    scores: { min, max, belowMin },
    skips,
  }
}

/** One redacted line for the worker log, so "where did the 92 go?" is answerable at a glance. */
export function formatFunnel(candidateId: string, runId: string | null, d: FunnelDiagnostics): string {
  const scoreRange = d.scores.min === null ? 'n/a' : `${d.scores.min}..${d.scores.max}`
  const skips = Object.entries(d.skips)
    .map(([reason, count]) => `${reason}×${count}`)
    .join(', ')
  return (
    `[automation] run=${runId ?? 'adhoc'} candidate=${candidateId} ` +
    `discovered=${d.discovered} dedup=${d.deduplicated}(-${d.duplicatesRemoved}) ` +
    `matched=${d.matched} prepared=${d.prepared} ` +
    `cv=${d.cvPresent ? 'yes' : 'MISSING'} ` +
    `scores=[${scoreRange}] belowMin(${d.scores.belowMin}) ` +
    `skips={${skips}}`
  )
}
