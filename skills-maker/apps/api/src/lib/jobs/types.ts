// ─────────────────────────────────────────────────────────────────────────────
// Job Provider Abstraction
// One provider per external job source. Adding a source means adding a file
// here and registering it — the GraphQL surface and the client stay untouched.
// ─────────────────────────────────────────────────────────────────────────────

export const JOB_SOURCE = {
  indeed: 'INDEED',
  linkedin: 'LINKEDIN',
  hellowork: 'HELLOWORK',
  franceTravail: 'FRANCE_TRAVAIL',
  jooble: 'JOOBLE',
} as const

export type JobSourceId = (typeof JOB_SOURCE)[keyof typeof JOB_SOURCE]

export const SALARY_PERIOD = {
  hour: 'HOUR',
  month: 'MONTH',
  year: 'YEAR',
} as const

export type SalaryPeriod = (typeof SALARY_PERIOD)[keyof typeof SALARY_PERIOD]

export interface NormalizedSalary {
  /** Raw label from the source — always displayable, even when parsing fails. */
  label: string
  min: number | null
  max: number | null
  currency: string | null
  period: SalaryPeriod | null
}

export interface NormalizedJob {
  id: string
  source: JobSourceId
  title: string
  company: string | null
  location: string
  description: string
  applyUrl: string
  /** ISO 8601, null when the source does not publish a date. */
  postedAt: string | null
  salary: NormalizedSalary | null
  /** Contract type, experience level, sector… as published by the source. */
  tags: string[]
  isRemote: boolean
}

export const CONTRACT_TYPE = {
  permanent: 'PERMANENT',
  fixedTerm: 'FIXED_TERM',
  apprenticeship: 'APPRENTICESHIP',
  internship: 'INTERNSHIP',
  temporary: 'TEMPORARY',
  freelance: 'FREELANCE',
  seasonal: 'SEASONAL',
} as const

export type ContractType = (typeof CONTRACT_TYPE)[keyof typeof CONTRACT_TYPE]

export const EXPERIENCE_LEVEL = { entry: 'ENTRY', junior: 'JUNIOR', senior: 'SENIOR' } as const

export type ExperienceLevel = (typeof EXPERIENCE_LEVEL)[keyof typeof EXPERIENCE_LEVEL]

export const WORK_TIME = { fullTime: 'FULL_TIME', partTime: 'PART_TIME' } as const

export type WorkTime = (typeof WORK_TIME)[keyof typeof WORK_TIME]

export const POSTED_WITHIN = {
  day: 'DAY',
  threeDays: 'THREE_DAYS',
  week: 'WEEK',
  month: 'MONTH',
} as const

export type PostedWithin = (typeof POSTED_WITHIN)[keyof typeof POSTED_WITHIN]

export const JOB_FILTER_KIND = {
  contractType: 'CONTRACT_TYPE',
  experienceLevel: 'EXPERIENCE_LEVEL',
  workTime: 'WORK_TIME',
  postedWithin: 'POSTED_WITHIN',
} as const

export type JobFilterKind = (typeof JOB_FILTER_KIND)[keyof typeof JOB_FILTER_KIND]

export interface JobSearchQuery {
  keywords?: string
  location?: string
  limit: number
  contractTypes?: ContractType[]
  experienceLevel?: ExperienceLevel
  workTime?: WorkTime
  postedWithin?: PostedWithin
}

export interface JobSearchOutcome {
  jobs: NormalizedJob[]
  /** Total matches upstream when the source reports it — may exceed `jobs.length`. */
  total: number | null
}

export interface JobProvider {
  id: JobSourceId
  /** False when the required API keys are absent — the source is then hidden from clients. */
  isConfigured(): boolean
  /** Filters this source can honour; the client hides the rest instead of faking them. */
  supportedFilters: JobFilterKind[]
  search(query: JobSearchQuery): Promise<JobSearchOutcome>
}
