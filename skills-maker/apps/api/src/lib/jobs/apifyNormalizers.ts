// ─────────────────────────────────────────────────────────────────────────────
// Apify dataset → NormalizedJob
//
// Ported from the legacy Next.js app, which held two near-identical copies of
// this mapping: apps/web/lib/jobs/aggregator.ts (live runs) and
// apps/web/lib/jobs/runsLoader.ts (pre-downloaded runs). Both consume the same
// Apify dataset shape, so a single set of normalizers now serves both paths.
// ─────────────────────────────────────────────────────────────────────────────

import { parseSalary } from './salaryParsing.js'
import { JOB_SOURCE, type JobSourceId, type NormalizedJob } from './types.js'

/** Apify items are untyped datasets — each scraper ships its own field names. */
type ApifyItem = Record<string, unknown>

const DESCRIPTION_MAX_LENGTH = 600
const REMOTE_PATTERN = /remote|t[ée]l[ée]travail/i

const asString = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number') return String(value)
  return null
}

const stripHtml = (value: unknown): string => {
  const text = asString(value)
  if (!text) return ''
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, DESCRIPTION_MAX_LENGTH)
}

const toIsoDate = (value: unknown): string | null => {
  const raw = asString(value)
  if (!raw) return null
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

const buildId = (source: JobSourceId, ...candidates: unknown[]): string => {
  const seed = candidates.map(asString).find(Boolean) ?? Math.random().toString(36).slice(2)
  return `${source}:${seed}`
}

const collectTags = (...values: unknown[]): string[] => {
  const tags = values.flatMap((value) => (Array.isArray(value) ? value : [value])).map(asString)
  return [...new Set(tags.filter((tag): tag is string => Boolean(tag)))].slice(0, 4)
}

export function normalizeIndeedItem(item: ApifyItem): NormalizedJob {
  // Indeed nests location and salary in objects, and ships jobType as an array.
  const rawLocation = item.location
  const location =
    typeof rawLocation === 'object' && rawLocation !== null
      ? (asString((rawLocation as ApifyItem).formattedAddressShort) ??
        asString((rawLocation as ApifyItem).city) ??
        asString((rawLocation as ApifyItem).fullAddress) ??
        '')
      : (asString(rawLocation) ?? '')

  const rawSalary = item.salary
  const salaryLabel =
    typeof rawSalary === 'object' && rawSalary !== null
      ? asString((rawSalary as ApifyItem).salaryText)
      : asString(rawSalary)

  const jobTypes = Array.isArray(item.jobType) ? item.jobType.map(asString) : [asString(item.jobType)]

  return {
    id: buildId(JOB_SOURCE.indeed, item.id, item.url),
    source: JOB_SOURCE.indeed,
    title: asString(item.title) ?? 'Poste non spécifié',
    company: asString(item.companyName),
    location,
    description: stripHtml(item.descriptionText ?? item.description),
    applyUrl: asString(item.applyUrl) ?? asString(item.url) ?? asString(item.jobUrl) ?? '',
    postedAt: toIsoDate(item.datePublished),
    salary: parseSalary(salaryLabel),
    // Indeed mixes the remote mention into jobType — drop it here, isRemote already carries it.
    tags: collectTags(jobTypes.filter((type) => !REMOTE_PATTERN.test(type ?? ''))),
    isRemote: jobTypes.some((type) => REMOTE_PATTERN.test(type ?? '')),
  }
}

export function normalizeLinkedInItem(item: ApifyItem): NormalizedJob {
  return {
    id: buildId(JOB_SOURCE.linkedin, item.id, item.url),
    source: JOB_SOURCE.linkedin,
    title: asString(item.title) ?? 'Poste non spécifié',
    company: asString(item.companyName),
    location: asString(item.location) ?? '',
    description: stripHtml(item.description),
    applyUrl: asString(item.applyUrl) ?? asString(item.url) ?? '',
    postedAt: toIsoDate(item.postedDate),
    salary: parseSalary(asString(item.salary)),
    tags: collectTags(item.contractType, item.experienceLevel, item.sector),
    isRemote: REMOTE_PATTERN.test(asString(item.workType) ?? ''),
  }
}

export function normalizeHelloWorkItem(item: ApifyItem): NormalizedJob {
  return {
    id: buildId(JOB_SOURCE.hellowork, item.job_id, item.link),
    source: JOB_SOURCE.hellowork,
    title: asString(item.job_title) ?? 'Poste non spécifié',
    company: asString(item.company),
    location: asString(item.location) ?? asString(item.city) ?? '',
    description: stripHtml(item.description),
    applyUrl: asString(item.link) ?? '',
    postedAt: toIsoDate(item.publication_date ?? item.extraction_date),
    salary: parseSalary(asString(item.salary)),
    tags: collectTags(item.contract, item.experiences, item.industries),
    isRemote: Boolean(asString(item.remote)),
  }
}

export const NORMALIZERS: Record<string, (item: ApifyItem) => NormalizedJob> = {
  [JOB_SOURCE.indeed]: normalizeIndeedItem,
  [JOB_SOURCE.linkedin]: normalizeLinkedInItem,
  [JOB_SOURCE.hellowork]: normalizeHelloWorkItem,
}
