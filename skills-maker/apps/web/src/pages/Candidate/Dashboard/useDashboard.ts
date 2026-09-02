import { ROUTES } from '@/constants/routes'

/** How a stat value is rendered — maps to a `common.format.*` message. */
export const STAT_FORMAT = {
  count: 'count',
  percent: 'percent',
  ratio: 'ratio',
} as const

export type StatFormat = (typeof STAT_FORMAT)[keyof typeof STAT_FORMAT]

export type StatItem = {
  labelId: string
  value: number
  /** Denominator, only meaningful for the `ratio` format. */
  total?: number
  format: StatFormat
}

export type GoalItem = {
  labelId: string
  /** Completion, 0–100. */
  progress: number
}

export type QuickLink = {
  to: string
  labelId: string
  descriptionId: string
}

const QUICK_LINKS: QuickLink[] = [
  {
    to: ROUTES.candidate.cv,
    labelId: 'nav.candidate.cv',
    descriptionId: 'candidate.dashboard.quickAccess.cv.description',
  },
  {
    to: ROUTES.candidate.jobs,
    labelId: 'nav.candidate.jobs',
    descriptionId: 'candidate.dashboard.quickAccess.jobs.description',
  },
  {
    to: ROUTES.candidate.matching,
    labelId: 'nav.candidate.matching',
    descriptionId: 'candidate.dashboard.quickAccess.matching.description',
  },
  {
    to: ROUTES.candidate.coaching,
    labelId: 'nav.candidate.coaching',
    descriptionId: 'candidate.dashboard.quickAccess.coaching.description',
  },
  {
    to: ROUTES.candidate.coaches,
    labelId: 'candidate.dashboard.quickAccess.coaches.label',
    descriptionId: 'candidate.dashboard.quickAccess.coaches.description',
  },
  {
    to: ROUTES.candidate.formations,
    labelId: 'nav.candidate.formations',
    descriptionId: 'candidate.dashboard.quickAccess.formations.description',
  },
  {
    to: ROUTES.candidate.resources,
    labelId: 'nav.candidate.resources',
    descriptionId: 'candidate.dashboard.quickAccess.resources.description',
  },
]

// TODO: read these from the candidate dashboard query once the API exposes it.
export const useDashboard = () => {
  const stats: StatItem[] = [
    { labelId: 'candidate.dashboard.stats.targetedJobs', value: 0, format: STAT_FORMAT.count },
    { labelId: 'candidate.dashboard.stats.matchingScore', value: 0, format: STAT_FORMAT.percent },
    { labelId: 'candidate.dashboard.stats.interviews', value: 0, format: STAT_FORMAT.count },
    {
      labelId: 'candidate.dashboard.stats.goals',
      value: 0,
      total: 0,
      format: STAT_FORMAT.ratio,
    },
    { labelId: 'candidate.dashboard.stats.formations', value: 0, format: STAT_FORMAT.count },
  ]

  const goals: GoalItem[] = [
    { labelId: 'candidate.dashboard.goals.cv', progress: 0 },
    { labelId: 'candidate.dashboard.goals.weeklyApplications', progress: 0 },
    { labelId: 'candidate.dashboard.goals.workshops', progress: 0 },
    { labelId: 'candidate.dashboard.goals.matchingTarget', progress: 0 },
  ]

  return {
    stats,
    goals,
    quickLinks: QUICK_LINKS,
    hasApplications: false,
    isAiEnabled: true,
  }
}
