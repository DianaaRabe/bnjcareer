// ─────────────────────────────────────────────────────────────────────────────
// Automation limits.
//
// Two rules drive all of this:
//  - the candidate configures a *preference*, the server owns the *ceiling*
//    (skill §16). A candidate can lower their volume, never raise it past ours.
//  - a missing row is not an implicit "yes". Automation is off until it is
//    explicitly enabled (skill §25), so `resolveAutomationSettings(null).enabled`
//    is false no matter what defaults are in place.
// ─────────────────────────────────────────────────────────────────────────────

import type { AutomationFrequency } from '@prisma/client'

export const AUTOMATION_DEFAULTS = {
  /** Applied when the candidate enabled automation without choosing a volume. */
  maxApplicationsPerRun: 5,
  maxApplicationsPerDay: 10,
  /**
   * 65 sits at the bottom of the skill's "core of the role is covered" band. Below
   * it an application is more likely to hurt the candidate's reputation than help.
   */
  minMatchScore: 65,
} as const

/** Absolute ceilings. A candidate value above these is clamped, not rejected. */
export const AUTOMATION_CEILINGS = {
  maxApplicationsPerRun: 20,
  maxApplicationsPerDay: 50,
  minMatchScore: 95,
} as const

/** How far ahead the next run is scheduled from the previous completion. */
export const AUTOMATION_INTERVAL_MS: Record<AutomationFrequency, number> = {
  DAILY: 24 * 60 * 60 * 1000,
  WEEKLY: 7 * 24 * 60 * 60 * 1000,
}

/** A worker whose heartbeat is older than this is considered dead; its run can be reclaimed. */
export const RUN_STALE_AFTER_MS = 15 * 60 * 1000

/**
 * Minimum spacing between two consecutive LLM calls in a single run (matching + letter).
 * The free provider tiers rate-limit aggressively; pacing the loop keeps a burst of jobs from
 * tripping 429s on every key at once. It is a floor, not a hard sleep — a slow call that already
 * took longer than this incurs no extra wait.
 */
export const MATCH_PACING_MS = 350

export interface AutomationSettingsRow {
  enabled: boolean
  frequency: AutomationFrequency
  maxApplicationsPerRun: number | null
  maxApplicationsPerDay: number | null
  minMatchScore: number | null
  approvalMode: boolean
  keywords: string[]
  locations: string[]
  contractTypes: string[]
}

export interface AutomationSettingsResolved {
  enabled: boolean
  frequency: AutomationFrequency
  maxApplicationsPerRun: number
  maxApplicationsPerDay: number
  minMatchScore: number
  approvalMode: boolean
  keywords: string[]
  locations: string[]
  contractTypes: string[]
}

const clampInt = (value: number | null | undefined, fallback: number, ceiling: number): number => {
  if (value == null || !Number.isFinite(value)) return fallback
  const rounded = Math.round(value)
  if (rounded < 1) return 1
  return Math.min(rounded, ceiling)
}

/**
 * Effective settings for one candidate. Null row = automation disabled with server defaults;
 * null individual fields = "use the server default", never "no limit".
 */
export function resolveAutomationSettings(row: AutomationSettingsRow | null): AutomationSettingsResolved {
  if (!row) {
    return {
      enabled: false,
      frequency: 'WEEKLY',
      ...AUTOMATION_DEFAULTS,
      approvalMode: true,
      keywords: [],
      locations: [],
      contractTypes: [],
    }
  }

  return {
    enabled: row.enabled === true,
    frequency: row.frequency,
    maxApplicationsPerRun: clampInt(
      row.maxApplicationsPerRun,
      AUTOMATION_DEFAULTS.maxApplicationsPerRun,
      AUTOMATION_CEILINGS.maxApplicationsPerRun,
    ),
    maxApplicationsPerDay: clampInt(
      row.maxApplicationsPerDay,
      AUTOMATION_DEFAULTS.maxApplicationsPerDay,
      AUTOMATION_CEILINGS.maxApplicationsPerDay,
    ),
    minMatchScore: clampInt(
      row.minMatchScore,
      AUTOMATION_DEFAULTS.minMatchScore,
      AUTOMATION_CEILINGS.minMatchScore,
    ),
    approvalMode: row.approvalMode !== false,
    keywords: [...row.keywords],
    locations: [...row.locations],
    contractTypes: [...row.contractTypes],
  }
}

/** When the next run is due, measured from a completion rather than from a wall-clock slot. */
export function nextRunAt(frequency: AutomationFrequency, from: Date): Date {
  return new Date(from.getTime() + AUTOMATION_INTERVAL_MS[frequency])
}
