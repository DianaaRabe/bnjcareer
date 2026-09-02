import {
  ContractType,
  ExperienceLevel,
  JobSource,
  PostedWithin,
  WorkTime,
  type SearchJobsQuery,
} from '@/gql/graphql'

export type Job = SearchJobsQuery['searchJobs']['jobs'][number]

export type JobSalary = NonNullable<Job['salary']>

export const JOB_SOURCE_LABEL_IDS: Record<JobSource, string> = {
  [JobSource.Indeed]: 'candidate.jobs.source.indeed',
  [JobSource.Linkedin]: 'candidate.jobs.source.linkedin',
  [JobSource.Hellowork]: 'candidate.jobs.source.hellowork',
  [JobSource.FranceTravail]: 'candidate.jobs.source.franceTravail',
  [JobSource.Jooble]: 'candidate.jobs.source.jooble',
}

/** Recognition dots only — never used as fills or backgrounds. */
export const JOB_SOURCE_COLORS: Record<JobSource, string> = {
  [JobSource.Indeed]: '#2554c7',
  [JobSource.Linkedin]: '#0a66c2',
  [JobSource.Hellowork]: '#0f7a5c',
  [JobSource.FranceTravail]: '#1f5aa8',
  [JobSource.Jooble]: '#0f8a7e',
}

export const AVATAR_PALETTE = [
  { bg: 'bg-accent', fg: 'text-primary' },
  { bg: 'bg-secondary', fg: 'text-secondary-foreground' },
  { bg: 'bg-primary/10', fg: 'text-primary' },
  { bg: 'bg-muted', fg: 'text-foreground' },
] as const

export type JobAvatar = (typeof AVATAR_PALETTE)[number]

/** A job enriched with the presentation bits computed once in the hook. */
export type JobListItem = Job & { initial: string; avatar: JobAvatar; sourceColor: string }

/** Page size requested from the API. */
export const JOBS_PAGE_SIZE = 24

// Filter vocabularies come from the schema; only their labels live here.
export const CONTRACT_TYPE_OPTIONS: { value: ContractType; labelId: string }[] = [
  { value: ContractType.Permanent, labelId: 'candidate.jobs.filters.contract.permanent' },
  { value: ContractType.FixedTerm, labelId: 'candidate.jobs.filters.contract.fixedTerm' },
  { value: ContractType.Apprenticeship, labelId: 'candidate.jobs.filters.contract.apprenticeship' },
  { value: ContractType.Internship, labelId: 'candidate.jobs.filters.contract.internship' },
  { value: ContractType.Temporary, labelId: 'candidate.jobs.filters.contract.temporary' },
  { value: ContractType.Freelance, labelId: 'candidate.jobs.filters.contract.freelance' },
  { value: ContractType.Seasonal, labelId: 'candidate.jobs.filters.contract.seasonal' },
]

export const EXPERIENCE_LEVEL_OPTIONS: { value: ExperienceLevel; labelId: string }[] = [
  { value: ExperienceLevel.Entry, labelId: 'candidate.jobs.filters.experience.entry' },
  { value: ExperienceLevel.Junior, labelId: 'candidate.jobs.filters.experience.junior' },
  { value: ExperienceLevel.Senior, labelId: 'candidate.jobs.filters.experience.senior' },
]

export const WORK_TIME_OPTIONS: { value: WorkTime; labelId: string }[] = [
  { value: WorkTime.FullTime, labelId: 'candidate.jobs.filters.workTime.fullTime' },
  { value: WorkTime.PartTime, labelId: 'candidate.jobs.filters.workTime.partTime' },
]

export const POSTED_WITHIN_OPTIONS: { value: PostedWithin; labelId: string }[] = [
  { value: PostedWithin.Day, labelId: 'candidate.jobs.filters.posted.day' },
  { value: PostedWithin.ThreeDays, labelId: 'candidate.jobs.filters.posted.threeDays' },
  { value: PostedWithin.Week, labelId: 'candidate.jobs.filters.posted.week' },
  { value: PostedWithin.Month, labelId: 'candidate.jobs.filters.posted.month' },
]

export type JobFilters = {
  contractTypes: ContractType[]
  experienceLevel: ExperienceLevel | null
  workTime: WorkTime | null
  postedWithin: PostedWithin | null
}

export const EMPTY_JOB_FILTERS: JobFilters = {
  contractTypes: [],
  experienceLevel: null,
  workTime: null,
  postedWithin: null,
}

export const countActiveFilters = (filters: JobFilters) =>
  filters.contractTypes.length +
  (filters.experienceLevel ? 1 : 0) +
  (filters.workTime ? 1 : 0) +
  (filters.postedWithin ? 1 : 0)
