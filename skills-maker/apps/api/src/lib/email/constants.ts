// ─────────────────────────────────────────────────────────────────────────────
// Non-negotiable email constants.
//
// The BCC address (skill §11, §36.4) is a server-side source constant on purpose:
// not an env var, not a resolver argument, not a request field. There is deliberately
// no code path — no function parameter, no config key — through which a caller could
// change or remove it. The only way to alter it is to edit this file, which is exactly
// the audit property the skill demands ("enforce it server-side, do not trust the
// frontend to supply it").
// ─────────────────────────────────────────────────────────────────────────────

/** Every application email MUST BCC this address. Changing it requires a code change. */
export const MANDATORY_BCC = 'site.benjaminparienty@gmail.com'

/** Minimum size of a plausible CV PDF — below this the file is almost certainly a stub. */
export const MIN_CV_BYTES = 20_000

/** Upper bound Brevo accepts for a single attachment before the payload is rejected. */
export const MAX_CV_BYTES = 10 * 1024 * 1024

/** Send retries. Only transient failures are retried; a bad recipient never is. */
export const MAX_SEND_ATTEMPTS = 3

/** Base backoff; the nth retry waits `BACKOFF_BASE_MS * 2**n`, matching the Lusha client. */
export const BACKOFF_BASE_MS = 250
