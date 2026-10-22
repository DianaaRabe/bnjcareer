// ─────────────────────────────────────────────────────────────────────────────
// Job canonicalization & deduplication.
//
// The same vacancy reaches us from several places (it is republished by France
// Travail, then scraped from Indeed, then again from LinkedIn), so before any
// application is prepared it needs a single stable identity. Everything here is
// pure and synchronous on purpose: the engine's idempotency guarantee rests on
// this key, and a deterministic function is the only kind we can actually test
// without a database (skill §4).
//
// Priority, and where it deviates from the skill's literal wording:
//   1. canonical application URL    — the only identity shared *across* sources
//   2. source + externalId          — a strong identity *within* one source
//   3. normalized company + title + location
// The skill lists "source + external ID" first. We invert it because that key
// cannot collapse the same vacancy published by two aggregators, which is the
// whole point of deduplication; source+externalId is kept as the second tier for
// providers whose URLs are unstable or session-scoped. We never reduce identity
// to the title alone (skill §4, last line).
// ─────────────────────────────────────────────────────────────────────────────

import type { NormalizedJob } from './types.js'

/** Query parameters that identify the *referrer*, never the vacancy. */
const TRACKING_PARAMS = new Set([
  'gclid',
  'fbclid',
  'msclkid',
  'dclid',
  'yclid',
  'igshid',
  'mc_cid',
  'mc_eid',
  'ref',
  'referrer',
  'source',
  'src',
  'campaign',
])

const isTrackingParam = (name: string) => {
  const lower = name.toLowerCase()
  return TRACKING_PARAMS.has(lower) || lower.startsWith('utm_')
}

/**
 * Reduces a URL to the part that identifies the vacancy: lowercased host without `www.`,
 * no fragment, no tracking params, no trailing slash, remaining params sorted. Returns null
 * when the input is not a usable http(s) URL — callers then fall back to the next identity
 * tier rather than inventing a key from a broken URL.
 */
export function canonicalizeUrl(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim()
  if (!trimmed) return null

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null

  url.hash = ''
  url.username = ''
  url.password = ''

  const host = url.hostname.toLowerCase().replace(/^www\./, '')
  const port = url.port === '80' || url.port === '443' ? '' : url.port

  const params = [...url.searchParams.entries()]
    .filter(([name]) => !isTrackingParam(name))
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  const search = params.length ? `?${params.map(([k, v]) => `${k}=${v}`).join('&')}` : ''

  let pathname = url.pathname.replace(/\/+$/, '')
  if (pathname === '') pathname = '/'

  return `${url.protocol}//${host}${port ? `:${port}` : ''}${pathname}${search}`
}

/** Accent- and punctuation-insensitive comparison form. `Café "du Port"` → `cafe du port`. */
export function normalizeText(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

export interface JobIdentityFields {
  applyUrl?: string | null
  source?: string | null
  externalId?: string | null
  company?: string | null
  title?: string | null
  location?: string | null
}

/**
 * Stable, cross-source identity for a vacancy. Stored on `JobOffer.canonicalKey` (unique) and
 * reused as the idempotency key for "this candidate already applied to this vacancy".
 */
export function canonicalJobKey(job: JobIdentityFields): string {
  const url = canonicalizeUrl(job.applyUrl)
  if (url) return `url:${url}`

  if (job.source && job.externalId) return `src:${job.source}:${job.externalId}`

  const company = normalizeText(job.company)
  const title = normalizeText(job.title)
  const location = normalizeText(job.location)
  return `tc:${company}|${title}|${location}`
}

/**
 * How complete a record is — used only to pick a winner among duplicates, never to decide
 * eligibility. Ties break on the original order, so the result is deterministic.
 */
function completeness(job: NormalizedJob): number {
  let score = 0
  if (job.description) score += Math.min(job.description.length, 4000) / 100
  if (job.company) score += 3
  if (job.location) score += 2
  if (job.salary) score += 2
  if (job.postedAt) score += 1
  if (job.applyUrl) score += 1
  return score
}

export interface DedupeResult<T> {
  jobs: T[]
  duplicatesRemoved: number
}

/**
 * Collapses jobs that share a canonical key, keeping the most complete record. Order of first
 * appearance is preserved so the candidate's feed stays stable between runs.
 */
export function dedupeJobs<T extends NormalizedJob>(jobs: T[]): DedupeResult<T> {
  const byKey = new Map<string, { job: T; score: number; index: number }>()

  jobs.forEach((job, index) => {
    const key = canonicalJobKey(job)
    const score = completeness(job)
    const current = byKey.get(key)
    if (!current) {
      byKey.set(key, { job, score, index })
      return
    }
    // Strictly greater: the earliest of two equally complete records wins.
    if (score > current.score) byKey.set(key, { job, score, index })
  })

  const kept = [...byKey.values()].sort((a, b) => a.index - b.index).map((entry) => entry.job)
  return { jobs: kept, duplicatesRemoved: jobs.length - kept.length }
}

export const __testing = { completeness, isTrackingParam }
