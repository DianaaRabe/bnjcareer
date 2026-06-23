// ─────────────────────────────────────────────────────────────────────────────
// Aggregator Job Provider
// Wraps Apify-based scrapers (Indeed, LinkedIn, HelloWork).
// Used by FR and Africa tenants.
// ─────────────────────────────────────────────────────────────────────────────

import type { JobProvider, JobSearchQuery, JobProviderResult, NormalizedJob } from './types'

// Apify actor IDs
const ACTORS = {
  linkedin:  'RIGGeqD6RqKmlVoQU',
  hellowork: '3wmy1nLYOHocecwCj',
} as const

function apifyUrl(actorId: string, token: string) {
  return `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${token}`
}

async function runActor<T>(actorId: string, token: string, input: object): Promise<T[]> {
  const res = await fetch(apifyUrl(actorId, token), {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(input),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Apify error (${actorId}): ${err}`)
  }
  return res.json() as Promise<T[]>
}

// ── LinkedIn ──────────────────────────────────────────────────────────────────

async function searchLinkedIn(query: JobSearchQuery): Promise<NormalizedJob[]> {
  const token = process.env.APIFY_API_TOKEN
  if (!token) throw new Error('APIFY_API_TOKEN manquant')

  const raw = await runActor<any>(ACTORS.linkedin, token, {
    title:           query.keywords || 'Développeur',
    location:        query.location || 'France',
    datePosted:      'r604800',
    limit:           Math.min(query.limit || 25, 50),
    ...(query.contractType?.length    ? { contractType:    query.contractType }    : {}),
    ...(query.experienceLevel?.length ? { experienceLevel: query.experienceLevel } : {}),
    ...(query.remote?.length          ? { remote:          query.remote }          : {}),
  })

  return raw.map((item: any): NormalizedJob => ({
    id:               item.id ?? item.url,
    source:           'linkedin',
    title:            item.title         ?? 'Poste non spécifié',
    companyName:      item.companyName   ?? 'Entreprise inconnue',
    location:         item.location      ?? '',
    salary:           item.salary        ?? null,
    contractType:     item.contractType  ?? null,
    experienceLevel:  item.experienceLevel ?? null,
    sector:           item.sector        ?? null,
    remote:           item.workType      ?? null,
    jobUrl:           item.url           ?? '',
    applyUrl:         item.applyUrl ?? item.url ?? '',
    postedDate:       item.postedDate    ?? null,
    applicationsCount: item.applicationsCount ?? null,
    descriptionText:  item.description   ?? '',
  }))
}

// ── HelloWork ─────────────────────────────────────────────────────────────────

async function searchHelloWork(query: JobSearchQuery): Promise<NormalizedJob[]> {
  const token = process.env.APIFY_API_TOKEN_HELLOWORK
  if (!token) throw new Error('APIFY_API_TOKEN_HELLOWORK manquant')

  const validPeriods = ['all', '1d', '3d', '7d', '30d']
  const period = validPeriods.includes(query.period ?? '') ? query.period : '7d'

  const raw = await runActor<any>(ACTORS.hellowork, token, {
    keywords: query.keywords || 'Développeur',
    location: query.location || 'Paris',
    distance: '20',
    sort_by:  'relevance',
    period,
    limit:    Math.min(query.limit || 30, 100),
  })

  return raw.map((item: any): NormalizedJob => ({
    id:              String(item.job_id ?? item.link ?? Math.random()),
    source:          'hellowork',
    title:           item.job_title   ?? 'Poste non spécifié',
    companyName:     item.company     ?? 'Entreprise inconnue',
    companyLogo:     item.company_logo ?? null,
    location:        item.location    ?? item.city ?? '',
    salary:          item.salary      ?? null,
    contractType:    item.contract    ?? null,
    experienceLevel: item.experiences ?? null,
    sector:          item.industries  ?? null,
    remote:          item.remote      ?? null,
    jobUrl:          item.link        ?? '',
    applyUrl:        item.link        ?? '',
    postedDate:      item.extraction_date?.split('T')[0] ?? null,
    postedTimeAgo:   item.time        ?? null,
    descriptionText: item.description
      ? item.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      : '',
    descriptionHtml: item.description ?? '',
    department:      item.department  ?? null,
  } as NormalizedJob))
}

// ── Provider Implementation ───────────────────────────────────────────────────

export class AggregatorJobProvider implements JobProvider {
  async search(query: JobSearchQuery): Promise<JobProviderResult> {
    // Default: run LinkedIn + HelloWork in parallel and merge
    try {
      const [linkedin, hellowork] = await Promise.allSettled([
        searchLinkedIn(query),
        searchHelloWork(query),
      ])

      const items: NormalizedJob[] = [
        ...(linkedin.status  === 'fulfilled' ? linkedin.value  : []),
        ...(hellowork.status === 'fulfilled' ? hellowork.value : []),
      ]

      return { items }
    } catch (err: any) {
      return { items: [], error: err.message }
    }
  }

  async getById(id: string): Promise<NormalizedJob | null> {
    // Aggregators don't support single-job fetch — return null
    return null
  }
}
