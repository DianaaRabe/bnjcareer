import { GraphQLError } from 'graphql'
import { z } from 'zod'
import { messages } from '@/constants/messages.js'
import {
  CONTRACT_TYPE,
  EXPERIENCE_LEVEL,
  getConfiguredProviders,
  getProvider,
  JOB_SOURCE,
  POSTED_WITHIN,
  WORK_TIME,
  type JobSearchOutcome,
  type JobSourceId,
} from '@/lib/jobs/index.js'

const enumValues = <T extends Record<string, string>>(source: T) =>
  Object.values(source) as [T[keyof T], ...T[keyof T][]]

const DEFAULT_LIMIT = 24
const MAX_LIMIT = 50

const searchJobsSchema = z.object({
  source: z.enum([
    JOB_SOURCE.indeed,
    JOB_SOURCE.linkedin,
    JOB_SOURCE.hellowork,
    JOB_SOURCE.franceTravail,
    JOB_SOURCE.jooble,
  ]),
  keywords: z.string().trim().max(200).optional().nullable(),
  location: z.string().trim().max(200).optional().nullable(),
  limit: z.number().int().positive().max(MAX_LIMIT).optional().nullable(),
  contractTypes: z.array(z.enum(enumValues(CONTRACT_TYPE))).optional().nullable(),
  experienceLevel: z.enum(enumValues(EXPERIENCE_LEVEL)).optional().nullable(),
  workTime: z.enum(enumValues(WORK_TIME)).optional().nullable(),
  postedWithin: z.enum(enumValues(POSTED_WITHIN)).optional().nullable(),
})

export function listConfiguredSources() {
  return getConfiguredProviders().map(({ id, supportedFilters }) => ({ id, supportedFilters }))
}

export async function searchJobs(input: unknown): Promise<JobSearchOutcome & { source: JobSourceId }> {
  const parsed = searchJobsSchema.safeParse(input)
  if (!parsed.success) {
    throw new GraphQLError(messages.invalidJobSearchInput, { extensions: { code: 'BAD_USER_INPUT' } })
  }

  const { source, keywords, location, limit, contractTypes, experienceLevel, workTime, postedWithin } =
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

  try {
    const outcome = await provider.search({
      keywords: keywords ?? undefined,
      location: location ?? undefined,
      limit: limit ?? DEFAULT_LIMIT,
      contractTypes: supports('CONTRACT_TYPE') ? (contractTypes ?? undefined) : undefined,
      experienceLevel: supports('EXPERIENCE_LEVEL') ? (experienceLevel ?? undefined) : undefined,
      workTime: supports('WORK_TIME') ? (workTime ?? undefined) : undefined,
      postedWithin: supports('POSTED_WITHIN') ? (postedWithin ?? undefined) : undefined,
    })
    return { ...outcome, source }
  } catch (error) {
    console.error('[jobs] provider search failed:', error)
    throw new GraphQLError(messages.jobSearchFailed, { extensions: { code: 'JOB_SEARCH_FAILED' } })
  }
}
