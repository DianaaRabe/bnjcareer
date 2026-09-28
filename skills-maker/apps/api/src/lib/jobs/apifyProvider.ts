// ─────────────────────────────────────────────────────────────────────────────
// Apify scrapers — Indeed, LinkedIn, HelloWork.
//
// Ported from apps/web/lib/jobs/aggregator.ts (LinkedIn, HelloWork) and
// apps/web/app/api/scrapper/route.ts (Indeed), keeping the same actor ids and
// payloads. Two legacy behaviours are unified here: an empty search now serves
// the pre-downloaded runs instead of burning an Apify call, which is what the
// legacy /scrapper page did through a separate loader.
// ─────────────────────────────────────────────────────────────────────────────

import { env } from '@/config/env.js'
import { NORMALIZERS } from './apifyNormalizers.js'
import { loadPreviewJobs } from './previewRuns.js'
import {
  CONTRACT_TYPE,
  EXPERIENCE_LEVEL,
  JOB_FILTER_KIND,
  JOB_SOURCE,
  POSTED_WITHIN,
  WORK_TIME,
  type ContractType,
  type ExperienceLevel,
  type JobFilterKind,
  type JobProvider,
  type JobSearchOutcome,
  type JobSearchQuery,
  type JobSourceId,
  type PostedWithin,
  type WorkTime,
} from './types.js'

const RUN_SYNC_URL = 'https://api.apify.com/v2/acts'
/** Actors run synchronously and take tens of seconds — well past a default fetch timeout. */
const RUN_TIMEOUT_MS = 90_000

interface ApifyActorConfig {
  source: JobSourceId
  actorId: string
  getToken: () => string
  supportedFilters: JobFilterKind[]
  buildInput: (query: Required<Pick<JobSearchQuery, 'limit'>> & JobSearchQuery) => object
}

// ── Per-scraper filter vocabularies ──────────────────────────────────────────

/** Indeed accepts a single jobType string; values from the legacy IN_JOB_TYPES list. */
const INDEED_JOB_TYPES: Partial<Record<ContractType, string>> = {
  [CONTRACT_TYPE.permanent]: 'permanent',
  [CONTRACT_TYPE.fixedTerm]: 'contract',
  [CONTRACT_TYPE.internship]: 'internship',
  [CONTRACT_TYPE.temporary]: 'temporary',
  [CONTRACT_TYPE.freelance]: 'freelance',
  [CONTRACT_TYPE.seasonal]: 'seasonal',
}

const INDEED_WORK_TIME: Record<WorkTime, string> = {
  [WORK_TIME.fullTime]: 'fulltime',
  [WORK_TIME.partTime]: 'parttime',
}

const POSTED_WITHIN_DAYS: Record<PostedWithin, number> = {
  [POSTED_WITHIN.day]: 1,
  [POSTED_WITHIN.threeDays]: 3,
  [POSTED_WITHIN.week]: 7,
  [POSTED_WITHIN.month]: 30,
}

/** LinkedIn folds work time and contract into one parameter (legacy LI_CONTRACT). */
const LINKEDIN_CONTRACT: Partial<Record<ContractType, string>> = {
  [CONTRACT_TYPE.fixedTerm]: 'C',
  [CONTRACT_TYPE.internship]: 'I',
}

const LINKEDIN_WORK_TIME: Record<WorkTime, string> = {
  [WORK_TIME.fullTime]: 'F',
  [WORK_TIME.partTime]: 'P',
}

const LINKEDIN_EXPERIENCE: Record<ExperienceLevel, string[]> = {
  [EXPERIENCE_LEVEL.entry]: ['1', '2'],
  [EXPERIENCE_LEVEL.junior]: ['3'],
  [EXPERIENCE_LEVEL.senior]: ['4', '5'],
}

/** LinkedIn expects seconds-since-posted, e.g. r604800 for a week. */
const LINKEDIN_DATE_POSTED: Record<PostedWithin, string> = {
  [POSTED_WITHIN.day]: 'r86400',
  [POSTED_WITHIN.threeDays]: 'r259200',
  [POSTED_WITHIN.week]: 'r604800',
  [POSTED_WITHIN.month]: 'r2592000',
}

const HELLOWORK_PERIOD: Record<PostedWithin, string> = {
  [POSTED_WITHIN.day]: '1d',
  [POSTED_WITHIN.threeDays]: '3d',
  [POSTED_WITHIN.week]: '7d',
  [POSTED_WITHIN.month]: '30d',
}

const ACTOR_CONFIGS: ApifyActorConfig[] = [
  {
    source: JOB_SOURCE.indeed,
    actorId: 'MXLpngmVpE8WTESQr',
    getToken: () => env.APIFY_API_TOKEN,
    // The actor takes one jobType, so work time and contract share the slot.
    supportedFilters: [
      JOB_FILTER_KIND.contractType,
      JOB_FILTER_KIND.workTime,
      JOB_FILTER_KIND.postedWithin,
    ],
    buildInput: ({ keywords, location, limit, contractTypes, workTime, postedWithin }) => {
      const jobType = contractTypes?.map((type) => INDEED_JOB_TYPES[type]).find(Boolean)
      return {
        country: 'fr',
        query: keywords || 'Analyst',
        location: location || 'Paris',
        maxRows: Math.min(limit, 50),
        sort: 'date',
        fromDays: String(postedWithin ? POSTED_WITHIN_DAYS[postedWithin] : 14),
        enableUniqueJobs: true,
        includeSimilarJobs: false,
        ...(jobType ? { jobType } : workTime ? { jobType: INDEED_WORK_TIME[workTime] } : {}),
      }
    },
  },
  {
    source: JOB_SOURCE.linkedin,
    actorId: 'RIGGeqD6RqKmlVoQU',
    getToken: () => env.APIFY_API_TOKEN,
    supportedFilters: [
      JOB_FILTER_KIND.contractType,
      JOB_FILTER_KIND.experienceLevel,
      JOB_FILTER_KIND.workTime,
      JOB_FILTER_KIND.postedWithin,
    ],
    buildInput: ({ keywords, location, limit, contractTypes, experienceLevel, workTime, postedWithin }) => {
      const contract = [
        ...(contractTypes ?? []).map((type) => LINKEDIN_CONTRACT[type]),
        workTime ? LINKEDIN_WORK_TIME[workTime] : undefined,
      ].filter((value): value is string => Boolean(value))

      return {
        title: keywords || 'Développeur',
        location: location || 'France',
        datePosted: postedWithin ? LINKEDIN_DATE_POSTED[postedWithin] : 'r604800',
        limit: Math.min(limit, 50),
        ...(contract.length > 0 ? { contractType: contract } : {}),
        ...(experienceLevel ? { experienceLevel: LINKEDIN_EXPERIENCE[experienceLevel] } : {}),
      }
    },
  },
  {
    source: JOB_SOURCE.hellowork,
    actorId: '3wmy1nLYOHocecwCj',
    getToken: () => env.APIFY_API_TOKEN_HELLOWORK,
    // The actor exposes a publication period only.
    supportedFilters: [JOB_FILTER_KIND.postedWithin],
    buildInput: ({ keywords, location, limit, postedWithin }) => ({
      keywords: keywords || 'Développeur',
      location: location || 'Paris',
      distance: '20',
      sort_by: 'relevance',
      period: postedWithin ? HELLOWORK_PERIOD[postedWithin] : '7d',
      limit: Math.min(limit, 100),
    }),
  },
]

async function runActor(actorId: string, token: string, input: object): Promise<Record<string, unknown>[]> {
  const res = await fetch(`${RUN_SYNC_URL}/${actorId}/run-sync-get-dataset-items?token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(RUN_TIMEOUT_MS),
  })
  if (!res.ok) {
    throw new Error(`Apify actor ${actorId} failed (${res.status})`)
  }
  const items: unknown = await res.json()
  return Array.isArray(items) ? (items as Record<string, unknown>[]) : []
}

function createApifyProvider(config: ApifyActorConfig): JobProvider {
  const normalize = NORMALIZERS[config.source]

  return {
    id: config.source,

    isConfigured: () => Boolean(config.getToken()),

    supportedFilters: config.supportedFilters,

    async search(query: JobSearchQuery): Promise<JobSearchOutcome> {
      // Any active filter is an explicit intent — serve the actor, not the local runs.
      const hasFilters = Boolean(
        query.contractTypes?.length || query.experienceLevel || query.workTime || query.postedWithin,
      )
      const isBrowsing = !query.keywords?.trim() && !query.location?.trim() && !hasFilters
      if (isBrowsing) {
        const preview = loadPreviewJobs(config.source, query.limit)
        // Only skip the actor when the local datasets actually cover this source.
        if (preview.jobs.length > 0) return preview
      }

      const items = await runActor(config.actorId, config.getToken(), config.buildInput(query))
      return { jobs: items.map(normalize), total: items.length }
    },
  }
}

export const apifyProviders: JobProvider[] = ACTOR_CONFIGS.map(createApifyProvider)
