// ─────────────────────────────────────────────────────────────────────────────
// Site enricher — the free, deterministic half of contact resolution.
//
// Job boards almost never expose a recruiter address (France Travail anonymises the
// field outright). What companies do publish, on their own site, is a shared
// recruitment mailbox — which is both the address a candidature is meant for and the
// *least* personal data that can do the job, so it is tried before any paid
// people-data provider (skill §8, data minimisation).
//
// Every fetch goes through `safeFetchText`, because the URL ultimately originates
// from a job board payload and is therefore untrusted input.
// ─────────────────────────────────────────────────────────────────────────────

import { canReceiveMail, candidateDomains, domainOf, textMentionsCompany } from './companyDomains.js'
import { mapBounded } from './concurrency.js'
import { findEmailInText, rankApplicationEmails } from './emailAddresses.js'
import { safeFetchText } from './safeFetch.js'
import {
  CONTACT_CONFIDENCE,
  CONTACT_SOURCE,
  type ContactCandidate,
  type ContactEnricher,
  type ContactQuery,
} from './types.js'

/** Pages a company typically publishes a contactable mailbox on, cheapest first. */
const CONTACT_PATHS = [
  '/contact',
  '/contacts',
  '/mentions-legales',
  '/nous-rejoindre',
  '/recrutement',
  '/carrieres',
  '/jobs',
]

const PATH_CONCURRENCY = 4

/** Harvests every plausible address from one page. */
function emailsOnPage(html: string): string[] {
  // `findEmailInText` normalises the escaping artefacts first; the regex is then
  // applied globally over the normalised text.
  const normalised = html.replace(/\\u[0-9a-fA-F]{4}/g, ' ').replace(/&#?\w{2,8};/g, ' ')
  const found = normalised.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}/g)
  if (found) return found

  const single = findEmailInText(html)
  return single ? [single] : []
}

/** Reads the contact-ish pages of a site and returns the ranked addresses published there. */
export async function scanSiteForEmails(baseUrl: string, timeoutMs?: number): Promise<string[]> {
  const base = baseUrl.replace(/\/+$/, '')
  const pages = await mapBounded(CONTACT_PATHS, PATH_CONCURRENCY, async (path) => {
    try {
      return await safeFetchText(base + path, timeoutMs ? { timeoutMs } : {})
    } catch {
      return ''
    }
  })

  return rankApplicationEmails(pages.flatMap(emailsOnPage))
}

/**
 * Resolves the company's real website from its name. Returns null rather than
 * guessing: a domain is only accepted when it can receive mail *and* the page it
 * serves actually mentions the company.
 */
export async function discoverCompanyWebsite(companyName: string): Promise<string | null> {
  for (const domain of candidateDomains(companyName)) {
    if (!(await canReceiveMail(domain))) continue

    for (const scheme of ['https://', 'http://']) {
      const candidate = scheme + domain
      const html = await safeFetchText(candidate).catch(() => '')
      if (html && textMentionsCompany(html, companyName)) return candidate
    }
  }
  return null
}

export const siteEnricher: ContactEnricher = {
  id: CONTACT_SOURCE.site,

  // No credentials involved — the site enricher is always available.
  isConfigured: () => true,

  async findContacts(query: ContactQuery): Promise<ContactCandidate[]> {
    const website = query.companyWebsite?.trim() || (query.companyName ? await discoverCompanyWebsite(query.companyName) : null)
    if (!website) return []

    const domain = domainOf(website)
    if (!domain) return []

    const emails = await scanSiteForEmails(website)
    if (emails.length > 0) {
      return emails.map((email) => ({
        email,
        contactName: null,
        source: CONTACT_SOURCE.site,
        confidence: CONTACT_CONFIDENCE.verified,
      }))
    }

    // Nothing published. The pattern is a guess and is labelled as one, so the
    // application engine routes it to review instead of sending blind (skill §8).
    return [
      {
        email: `contact@${domain}`,
        contactName: null,
        source: CONTACT_SOURCE.site,
        confidence: CONTACT_CONFIDENCE.guessed,
      },
    ]
  },
}
