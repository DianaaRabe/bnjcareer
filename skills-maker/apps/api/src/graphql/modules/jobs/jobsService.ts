import { GraphQLError } from 'graphql'
import { z } from 'zod'
import type { Context } from '@/context.js'
import { messages } from '@/constants/messages.js'
import { recordApplication } from '@/lib/candidateTracking.js'
import {
  CONTRACT_TYPE,
  EXPERIENCE_LEVEL,
  getConfiguredProviders,
  getProvider,
  JOB_SOURCE,
  POSTED_WITHIN,
  WORK_TIME,
  type JobProvider,
  type JobSearchOutcome,
  type JobSearchQuery,
  type JobSourceId,
} from '@/lib/jobs/index.js'

const enumValues = <T extends Record<string, string>>(source: T) =>
  Object.values(source) as [T[keyof T], ...T[keyof T][]]

const DEFAULT_LIMIT = 24
const MAX_LIMIT = 50

// ── Provider result cache ───────────────────────────────────────────────
// Aggregator calls cost tokens/quota and are slow. Identical searches (the profile-seeded
// default feed especially) repeat a lot across candidates, so we memoise each provider
// response for a short window. In-memory only: a redeploy clears it, which is fine — the
// goal is to collapse bursts of identical calls, not to persist a catalogue.
const SEARCH_CACHE_TTL_MS = 10 * 60 * 1000
const SEARCH_CACHE_MAX_ENTRIES = 200

type SearchOutcomeValue = JobSearchOutcome & { source: JobSourceId }
const searchCache = new Map<string, { value: SearchOutcomeValue; expiresAt: number }>()

const searchCacheKey = (input: Record<string, unknown>) =>
  JSON.stringify({
    source: input.source,
    keywords: (input.keywords as string | null)?.trim().toLowerCase() || null,
    location: (input.location as string | null)?.trim().toLowerCase() || null,
    limit: input.limit ?? DEFAULT_LIMIT,
    contractTypes: [...((input.contractTypes as string[] | null) ?? [])].sort(),
    experienceLevel: input.experienceLevel ?? null,
    workTime: input.workTime ?? null,
    postedWithin: input.postedWithin ?? null,
  })

const readSearchCache = (key: string): SearchOutcomeValue | null => {
  const hit = searchCache.get(key)
  if (!hit) return null
  if (hit.expiresAt <= Date.now()) {
    searchCache.delete(key)
    return null
  }
  return hit.value
}

const writeSearchCache = (key: string, value: SearchOutcomeValue) => {
  // Bounded LRU-ish eviction: drop the oldest inserted entry when full.
  if (searchCache.size >= SEARCH_CACHE_MAX_ENTRIES) {
    const oldest = searchCache.keys().next().value
    if (oldest !== undefined) searchCache.delete(oldest)
  }
  searchCache.set(key, { value, expiresAt: Date.now() + SEARCH_CACHE_TTL_MS })
}

const searchJobsSchema = z.object({
  source: z.enum([
    JOB_SOURCE.indeed,
    JOB_SOURCE.linkedin,
    JOB_SOURCE.hellowork,
    JOB_SOURCE.franceTravail,
    JOB_SOURCE.jooble,
    JOB_SOURCE.international,
  ]),
  keywords: z.string().trim().max(200).optional().nullable(),
  location: z.string().trim().max(200).optional().nullable(),
  limit: z.number().int().positive().max(MAX_LIMIT).optional().nullable(),
  contractTypes: z.array(z.enum(enumValues(CONTRACT_TYPE))).optional().nullable(),
  experienceLevel: z.enum(enumValues(EXPERIENCE_LEVEL)).optional().nullable(),
  workTime: z.enum(enumValues(WORK_TIME)).optional().nullable(),
  postedWithin: z.enum(enumValues(POSTED_WITHIN)).optional().nullable(),
  broadenIfEmpty: z.boolean().optional().nullable(),
})

export function listConfiguredSources() {
  return getConfiguredProviders().map(({ id, supportedFilters }) => ({ id, supportedFilters }))
}

const trackJobApplicationSchema = z.object({
  title: z.string().trim().min(1).max(300),
  company: z.string().trim().max(300).optional().nullable(),
  description: z.string().trim().max(20000).optional().nullable(),
  source: z.string().trim().max(50).optional().nullable(),
  applyUrl: z.string().trim().max(2000).optional().nullable(),
})

/** Persists a "postuler" click so the candidate dashboard reflects the application. */
export async function trackJobApplication(ctx: Context, input: unknown): Promise<boolean> {
  const parsed = trackJobApplicationSchema.safeParse(input)
  if (!parsed.success) {
    throw new GraphQLError(messages.invalidJobSearchInput, { extensions: { code: 'BAD_USER_INPUT' } })
  }

  await recordApplication(
    ctx,
    {
      title: parsed.data.title,
      company: parsed.data.company,
      description: parsed.data.description,
      source: parsed.data.source,
      url: parsed.data.applyUrl,
    },
    { status: 'SENT' },
  )
  return true
}

/** One provider call, memoised by its exact effective params (see the cache note above). */
async function runProviderSearch(
  provider: JobProvider,
  source: JobSourceId,
  query: JobSearchQuery,
): Promise<SearchOutcomeValue> {
  const cacheKey = searchCacheKey({ source, ...query })
  const cached = readSearchCache(cacheKey)
  if (cached) return cached

  try {
    const outcome = await provider.search(query)
    const value = { ...outcome, source }
    writeSearchCache(cacheKey, value)
    return value
  } catch (error) {
    console.error('[jobs] provider search failed:', error)
    throw new GraphQLError(messages.jobSearchFailed, { extensions: { code: 'JOB_SEARCH_FAILED' } })
  }
}

export async function searchJobs(input: unknown): Promise<JobSearchOutcome & { source: JobSourceId }> {
  const parsed = searchJobsSchema.safeParse(input)
  if (!parsed.success) {
    throw new GraphQLError(messages.invalidJobSearchInput, { extensions: { code: 'BAD_USER_INPUT' } })
  }

  const { source, keywords, location, limit, contractTypes, experienceLevel, workTime, postedWithin, broadenIfEmpty } =
    parsed.data
  const provider = getProvider(source)
  if (!provider?.isConfigured()) {
    throw new GraphQLError(messages.jobSourceNotConfigured, {
      extensions: { code: 'JOB_SOURCE_NOT_CONFIGURED' },
    })
  }

  // Drop filters this source cannot honour rather than silently returning unfiltered results.
  const supports = (kind: (typeof provider.supportedFilters)[number]) =>
    provider.supportedFilters.includes(kind)
  const effectiveLimit = limit ?? DEFAULT_LIMIT

  // The primary attempt: exactly what was asked (profile-seeded feed or explicit search).
  const primary: JobSearchQuery = {
    keywords: keywords ?? undefined,
    location: location ?? undefined,
    limit: effectiveLimit,
    contractTypes: supports('CONTRACT_TYPE') ? (contractTypes ?? undefined) : undefined,
    experienceLevel: supports('EXPERIENCE_LEVEL') ? (experienceLevel ?? undefined) : undefined,
    workTime: supports('WORK_TIME') ? (workTime ?? undefined) : undefined,
    postedWithin: supports('POSTED_WITHIN') ? (postedWithin ?? undefined) : undefined,
  }

  // Broadest-last fallbacks, used only for the default (profile-seeded) feed so the candidate
  // never lands on an empty page. An explicit search keeps its own empty result untouched.
  const attempts: JobSearchQuery[] = [primary]
  if (broadenIfEmpty) {
    // 1) Keep the keywords (sector/skills) but drop the filters that most often over-narrow.
    attempts.push({ keywords: keywords ?? undefined, location: location ?? undefined, limit: effectiveLimit })
    // 2) Last resort: the source's generic top listings — like the pre-profile behaviour.
    attempts.push({ limit: effectiveLimit })
  }

  let last: SearchOutcomeValue | null = null
  for (const query of attempts) {
    last = await runProviderSearch(provider, source, query)
    if (last.jobs.length > 0) return last
  }
  // All attempts empty (or broadening disabled): return the last outcome as-is.
  return last as SearchOutcomeValue
}
