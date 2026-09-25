/** Bump on any contract edit — past signatures stay bound to the version they carry. */
export const CURRENT_CONTRACT_VERSION = '2026-06-01'

/** Revenue split, single source of truth — the page reads it, the signature freezes it. */
export const SUBSCRIPTION_SHARE_COACH_PCT = 25
export const FORMATION_SHARE_PLATFORM_PCT = 25

/** A signature has to be a plausible name, not an initial. */
export const MIN_SIGNED_NAME_LENGTH = 3
export const MAX_SIGNED_NAME_LENGTH = 120
