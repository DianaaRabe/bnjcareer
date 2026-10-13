// ─────────────────────────────────────────────────────────────────────────────
// Company name → a domain that actually exists.
//
// Job boards give a company *name*, not a website. Guessing `name.fr` is only
// useful once two things are true: the domain accepts mail (an MX record), and the
// site behind it really is that company. The second check is what separates
// enrichment from a guess — without it "delys.fr" may belong to an unrelated firm
// and the candidature lands in a stranger's inbox.
// ─────────────────────────────────────────────────────────────────────────────

import { lookup, resolveMx } from 'node:dns/promises'

/** Legal forms and filler words that never appear in a domain. */
const NOISE_WORDS = new Set([
  'sas', 'sasu', 'sarl', 'eurl', 'sa', 'sci', 'scop', 'snc', 'group', 'groupe',
  'france', 'international', 'conseil', 'consulting', 'technologies', 'technology',
  'solutions', 'services', 'et', 'and', 'de', 'du', 'des', 'la', 'le', 'les', 'l', 'the',
])

/** Suffix likelihood, best first. */
const TLDS = ['.fr', '.com', '.net', '.io', '.co']

/** Max candidates worth probing per company — bounds the DNS work a single offer can cause. */
export const MAX_CANDIDATE_DOMAINS = 10

/** Lowercase, accent-free, punctuation-free word list. */
export function slugWords(value: string): string[] {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

/** The meaningful words of a company name — legal forms and fillers removed. */
export function companyKeywords(name: string): string[] {
  return slugWords(name).filter((word) => !NOISE_WORDS.has(word))
}

/**
 * Plausible domains for a company name, most likely first.
 *
 * Bases are the joined form, the hyphenated form, then the first meaningful word. The
 * TLD loop is the outer one on purpose: because the result is capped, iterating
 * base-major would spend the whole budget on one base's unlikely suffixes and never
 * probe 'name.fr' for the others. TLD-major means the most probable suffix is tried
 * for every base before moving on to a less probable one.
 */
export function candidateDomains(name: string): string[] {
  const words = companyKeywords(name)
  if (words.length === 0) return []

  const bases: string[] = [words.join('')]
  if (words.length > 1) {
    bases.push(words.join('-'))
    bases.push(words[0])
  }

  const usable = [...new Set(bases)].filter((base) => base.length >= 3 && base.length <= 40)

  const domains: string[] = []
  for (const tld of TLDS) {
    for (const base of usable) domains.push(base + tld)
  }

  return domains.slice(0, MAX_CANDIDATE_DOMAINS)
}

/**
 * True when the domain publishes a mail exchanger, or at least an A record. The A
 * fallback matches how mail is often (mis)configured in practice: delivery still
 * works, so refusing these would lose real contacts.
 */
export async function canReceiveMail(domain: string): Promise<boolean> {
  try {
    const records = await resolveMx(domain)
    if (records.length > 0) return true
  } catch {
    // No MX — fall through to the A-record check.
  }

  try {
    const addresses = await lookup(domain, { all: true })
    return addresses.length > 0
  } catch {
    return false
  }
}

/** Strips scheme, `www.` and path, leaving the bare hostname. */
export function domainOf(url: string): string | null {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

/**
 * True when the page text plausibly belongs to the named company — at least half of
 * its meaningful words appear. Guards against domain homonyms.
 */
export function textMentionsCompany(text: string, companyName: string): boolean {
  const words = companyKeywords(companyName).filter((word) => word.length > 2)
  if (words.length === 0) return false

  const haystack = slugWords(text).join(' ')
  const hits = words.filter((word) => haystack.includes(word)).length
  return hits >= Math.max(1, Math.floor(words.length / 2))
}
