// ─────────────────────────────────────────────────────────────────────────────
// Jooble — worldwide aggregator (69 countries), free API key.
// Already indexes LinkedIn, Indeed and company career pages, so it covers the
// ground the legacy Apify scrapers used to.
// ─────────────────────────────────────────────────────────────────────────────

import { env } from '@/config/env.js'
import { parseSalary } from './salaryParsing.js'
import {
  JOB_SOURCE,
  type JobProvider,
  type JobSearchOutcome,
  type JobSearchQuery,
  type NormalizedJob,
} from './types.js'

const API_BASE_URL = 'https://jooble.org/api'

interface JoobleOffer {
  id?: number | string
  title?: string
  location?: string
  snippet?: string
  salary?: string
  source?: string
  type?: string
  link?: string
  company?: string
  updated?: string
}

/** Snippets ship with light markup (<b>, &nbsp;) — the client renders plain text. */
function toPlainText(html: string | undefined): string {
  if (!html) return ''
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function toIsoDate(raw: string | undefined): string | null {
  if (!raw) return null
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function toNormalizedJob(offer: JoobleOffer, index: number): NormalizedJob {
  const type = offer.type?.trim() ?? ''
  const location = offer.location?.trim() ?? ''
  const tags = [type, offer.source?.trim()].filter((tag): tag is string => Boolean(tag))

  return {
    id: `${JOB_SOURCE.jooble}:${offer.id ?? offer.link ?? index}`,
    source: JOB_SOURCE.jooble,
    title: offer.title?.trim() || 'Untitled offer',
    company: offer.company?.trim() || null,
    location,
    description: toPlainText(offer.snippet),
    applyUrl: offer.link ?? '',
    postedAt: toIsoDate(offer.updated),
    salary: parseSalary(offer.salary),
    tags,
    isRemote: /remote|t[ée]l[ée]travail/i.test(`${type} ${location}`),
  }
}

export const joobleProvider: JobProvider = {
  id: JOB_SOURCE.jooble,

  isConfigured: () => Boolean(env.JOOBLE_API_KEY),

  // The free API takes keywords and location only.
  supportedFilters: [],

  async search({ keywords, location, limit }: JobSearchQuery): Promise<JobSearchOutcome> {
    const res = await fetch(`${API_BASE_URL}/${env.JOOBLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keywords: keywords?.trim() ?? '',
        location: location?.trim() ?? '',
        page: '1',
      }),
    })
    if (!res.ok) {
      throw new Error(`Jooble search failed (${res.status})`)
    }

    const json = (await res.json()) as { jobs?: JoobleOffer[]; totalCount?: number }
    const jobs = (json.jobs ?? []).slice(0, limit).map(toNormalizedJob)

    return { jobs, total: json.totalCount ?? null }
  },
}

export const __testing = { toNormalizedJob, toPlainText }
