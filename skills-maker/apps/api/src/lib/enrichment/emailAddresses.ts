// ─────────────────────────────────────────────────────────────────────────────
// Which addresses found on a company page may legitimately receive an application.
//
// Scraped mailboxes are noisy: tracking pixels, DPO/consent contacts, typo'd
// "noreply" artefacts and CDN hosts all look like addresses to a regex. Sending a
// candidature to one of those is worse than sending nothing, so rejection comes
// first and scoring only ranks what survives.
// ─────────────────────────────────────────────────────────────────────────────

/** Deliberately strict: no spaces, no trailing punctuation, real TLD. */
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}/

/**
 * Local parts that must never receive an application — machine mailboxes (bounces,
 * abuse handling) and privacy roles (DPO/RGPD), which are the opposite of a hiring
 * contact and would put candidate data in the wrong place.
 */
const REJECTED_LOCAL_PARTS = new Set([
  'noreply',
  'no-reply',
  'donotreply',
  'do-not-reply',
  'postmaster',
  'abuse',
  'privacy',
  'dpo',
  'rgpd',
  'webmaster',
  'hostmaster',
  'sentry',
  'wixpress',
])

/** Hosts that only appear because a page embeds a font/CDN URL. */
const REJECTED_DOMAINS = [
  'example.com',
  'example.org',
  'sentry.io',
  'wixpress.com',
  'googlemail.com.png',
  'sentry-next.wixpress.com',
]

/** Addresses ending in an asset extension are regex artefacts from image URLs. */
const ASSET_SUFFIXES = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.css', '.js']

/**
 * Recruitment-flavoured local parts, best first. These are the mailboxes a
 * candidature is actually meant for, so they outrank generic ones.
 */
const PRIORITISED_LOCAL_PARTS = [
  'recrutement',
  'recruitment',
  'rh',
  'hr',
  'candidature',
  'application',
  'carriere',
  'career',
  'emploi',
  'jobs',
  'job',
  'talent',
  'hiring',
]

/** Generic but legitimate fallbacks — a real inbox, just not a hiring-specific one. */
const GENERIC_LOCAL_PARTS = ['contact', 'info', 'hello', 'bonjour', 'administration']

/** Scans free text for the first plausible address, ignoring surrounding punctuation. */
export function findEmailInText(text: string): string | null {
  const normalised = normaliseObfuscation(text)
  const match = normalised.match(EMAIL_PATTERN)
  return match ? match[0].toLowerCase().replace(/[.,;:]+$/, '') : null
}

/**
 * Undoes the escaping that survives a JSON/HTML round-trip. Without this a
 * `\u003erecrutement@company.fr` artefact is captured with its escape prefix and
 * becomes an invalid address.
 */
export function normaliseObfuscation(text: string): string {
  return text
    .replace(/\\u[0-9a-fA-F]{4}/g, ' ')
    .replace(/&#?\w{2,8};/g, ' ')
    .replace(/%40/g, '@')
    .replace(/\s*\(at\)\s*/gi, '@')
}

export function isApplicationEmail(value: string): boolean {
  const email = value.trim().toLowerCase()
  if (!email || email.length > 254) return false
  if (!EMAIL_PATTERN.test(email)) return false
  if (ASSET_SUFFIXES.some((suffix) => email.endsWith(suffix))) return false
  if (REJECTED_DOMAINS.includes(email.split('@')[1] ?? '')) return false

  const local = email.split('@')[0] ?? ''
  if (REJECTED_LOCAL_PARTS.has(local)) return false
  // `no-reply-fr`, `noreply+tag`… the set only holds the bare forms.
  if ([...REJECTED_LOCAL_PARTS].some((rejected) => local.startsWith(rejected))) return false

  return true
}

/**
 * Ranks an address for candidature suitability. Higher is better; anything rejected
 * scores -1 and must be dropped rather than merely deprioritised.
 */
export function scoreApplicationEmail(value: string): number {
  const email = value.trim().toLowerCase()
  if (!isApplicationEmail(email)) return -1

  const [local, domain] = email.split('@')
  if (!local || !domain) return -1

  const priority = PRIORITISED_LOCAL_PARTS.findIndex((part) => local.startsWith(part))
  if (priority >= 0) return 100 - priority

  if (GENERIC_LOCAL_PARTS.includes(local)) return 40
  // A dot/underscore local part is usually a named person, not a shared mailbox.
  if (local.includes('.') || local.includes('_') || local.includes('-')) return 20
  return 10
}

/** Deduplicates, drops rejects, and returns the best candidates first. */
export function rankApplicationEmails(values: readonly string[]): string[] {
  const unique = new Set<string>()
  for (const value of values) {
    const email = value.trim().toLowerCase().replace(/[.,;:]+$/, '')
    if (isApplicationEmail(email)) unique.add(email)
  }
  return [...unique].sort((a, b) => scoreApplicationEmail(b) - scoreApplicationEmail(a))
}

/** Domain part of an address, or null when the value is not an address. */
export function emailDomain(value: string): string | null {
  const email = value.trim().toLowerCase()
  return isApplicationEmail(email) ? (email.split('@')[1] ?? null) : null
}
