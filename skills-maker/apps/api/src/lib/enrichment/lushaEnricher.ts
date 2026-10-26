// ─────────────────────────────────────────────────────────────────────────────
// Lusha enricher — the paid half of contact resolution.
//
// Used only after the company's own site has been read (siteEnricher): a published
// shared mailbox is both cheaper and less invasive than a named individual's work
// address, and skill §8 asks for the minimum data that gets the application sent.
//
// Lusha is a *people* database, so scoping matters. Findings verified in the docs:
//   - Prospecting accepts `filters.companies.include.domains`, which is what keeps a
//     search pinned to the one company the vacancy belongs to.
//   - `existingDataPoints: ["work_email"]` restricts results to contacts Lusha can
//     actually reveal an email for, so we do not pay for dead ends.
//   - Unrecognised filter values return zero results silently, so department names
//     are read from the API rather than hardcoded.
// ─────────────────────────────────────────────────────────────────────────────

import { domainOf } from './companyDomains.js'
import { discoverCompanyWebsite } from './siteEnricher.js'
import {
  isLushaConfigured,
  lushaDepartmentValues,
  lushaEnrichContacts,
  lushaProspectContacts,
  LushaError,
  type LushaContactPreview,
} from './lushaClient.js'
import {
  CONTACT_CONFIDENCE,
  CONTACT_SOURCE,
  type ContactCandidate,
  type ContactEnricher,
  type ContactQuery,
} from './types.js'

/**
 * Departments to prefer, best first. Matched case-insensitively against the names
 * Lusha actually publishes; if none match we fall back to no department filter,
 * which is broader but still correctly scoped to the company domain.
 */
const PREFERRED_DEPARTMENTS = ['human resources', 'hr', 'recruitment', 'talent', 'people']

/** Contacts enriched per vacancy. Lusha charges per revealed field, so this stays at one. */
const MAX_CONTACTS_PER_VACANCY = 1

/** Preview pages are free of PII but still cost a request; a small page is enough. */
const PREVIEW_PAGE_SIZE = 10

/** Department names are a near-static taxonomy — cached instead of fetched per search. */
const DEPARTMENT_CACHE_TTL_MS = 6 * 60 * 60 * 1000
let departmentCache: { values: string[]; expiresAt: number } | null = null

/** Clears the memoised department list. Test seam. */
export function resetLushaCaches(): void {
  departmentCache = null
}

async function preferredDepartmentNames(): Promise<string[]> {
  if (departmentCache && departmentCache.expiresAt > Date.now()) return departmentCache.values

  const available = await lushaDepartmentValues()
  const matched = available.filter((name) =>
    PREFERRED_DEPARTMENTS.some((preferred) => name.toLowerCase().includes(preferred)),
  )

  departmentCache = { values: matched, expiresAt: Date.now() + DEPARTMENT_CACHE_TTL_MS }
  return matched
}

/**
 * Lusha's confidence grades, best first. Ranked explicitly rather than compared as
 * strings: lexicographic order would put 'A' before 'A+', and an unknown grade must
 * sort last instead of winning the comparison.
 */
const GRADE_RANK: Record<string, number> = { 'A+': 0, A: 1, B: 2, C: 3, D: 4 }

const gradeRank = (grade: string | undefined): number => GRADE_RANK[(grade ?? '').toUpperCase()] ?? 99

/** Strongest email for a contact, by Lusha's own confidence grade. */
function pickBestEmail(emails: { email?: string; confidence?: string }[] | undefined): string | null {
  const usable = (emails ?? []).filter((entry): entry is { email: string; confidence?: string } => Boolean(entry?.email))
  if (usable.length === 0) return null

  return [...usable].sort((a, b) => gradeRank(a.confidence) - gradeRank(b.confidence))[0].email.toLowerCase()
}

/** Contacts Lusha can reveal an email for — `canReveal` reports it, and credits: 0 means free. */
function hasRevealableEmail(preview: LushaContactPreview): boolean {
  if (!preview.id) return false
  if (preview.error) return false
  return (preview.canReveal ?? []).some((option) => option.field === 'emails')
}

export const lushaEnricher: ContactEnricher = {
  id: CONTACT_SOURCE.lusha,

  isConfigured: isLushaConfigured,

  async findContacts(query: ContactQuery): Promise<ContactCandidate[]> {
    const domain =
      (query.companyWebsite ? domainOf(query.companyWebsite) : null) ??
      (query.companyName ? domainOf((await discoverCompanyWebsite(query.companyName)) ?? '') : null)
    // Without a company domain the search cannot be scoped, and an unscoped
    // prospecting query would return unrelated people — never worth the credits.
    if (!domain) return []

    const departments = await preferredDepartmentNames().catch(() => [] as string[])
    const contactFilters: Record<string, unknown> = { existingDataPoints: ['work_email'] }
    if (departments.length > 0) contactFilters.departments = departments

    const previews = await lushaProspectContacts(
      { companies: { include: { domains: [domain] } }, contacts: { include: contactFilters } },
      PREVIEW_PAGE_SIZE,
    )

    const targetIds = previews.filter(hasRevealableEmail).slice(0, MAX_CONTACTS_PER_VACANCY).map((preview) => preview.id!)
    if (targetIds.length === 0) return []

    const enriched = await lushaEnrichContacts(targetIds)

    return enriched.flatMap((contact) => {
      const email = pickBestEmail(contact.emails)
      if (!email) return []
      const name = contact.fullName ?? ([contact.firstName, contact.lastName].filter(Boolean).join(' ') || null)
      return [
        {
          email,
          contactName: name,
          source: CONTACT_SOURCE.lusha,
          confidence: CONTACT_CONFIDENCE.verified,
        },
      ]
    })
  },
}

// Kept importable so callers can recognise a Lusha-specific failure without reaching
// into the client module.
export { LushaError }

export const __testing = { pickBestEmail, hasRevealableEmail }
