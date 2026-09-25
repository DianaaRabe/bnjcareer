import type { QuickLink } from '@/components/common/QuickAccessCard/QuickAccessCard'
import { STAT_FORMAT, type StatItem } from '@/components/common/StatCard/StatCard'
import { ROUTES } from '@/constants/routes'
import { CoachingGoalKey, type MyCoachingQuery } from '@/gql/graphql'
import { useMyCoachingQuery } from '@/graphql/hooks/coaching'

export type GoalItem = {
  labelId: string
  /** Completion, 0–100. */
  progress: number
}

export type RecentApplication = MyCoachingQuery['myCoaching']['recentApplications'][number]

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

/** A done goal reads as 100% — the API nulls `progress` once the goal is reached. */
const goalProgress = (done: boolean, progress?: number | null) => (done ? 100 : (progress ?? 0))

/** Maps the dashboard's goal rows to the coaching goal keys the API returns. */
const DASHBOARD_GOALS: { labelId: string; key: CoachingGoalKey }[] = [
  { labelId: 'candidate.dashboard.goals.cv', key: CoachingGoalKey.Cv },
  { labelId: 'candidate.dashboard.goals.weeklyApplications', key: CoachingGoalKey.Applications },
  { labelId: 'candidate.dashboard.goals.workshops', key: CoachingGoalKey.Workshop },
  { labelId: 'candidate.dashboard.goals.matchingTarget', key: CoachingGoalKey.Matching },
]

export const useDashboard = () => {
  const { data } = useMyCoachingQuery()
  const overview = data?.myCoaching
  const s = overview?.stats

  const goalsByKey = new Map((overview?.goals ?? []).map((goal) => [goal.key, goal]))
  const doneGoals = (overview?.goals ?? []).filter((goal) => goal.done).length
  const totalGoals = overview?.goals.length ?? 0

  const stats: StatItem[] = [
    {
      labelId: 'candidate.dashboard.stats.targetedJobs',
      value: s?.applicationCount ?? 0,
      format: STAT_FORMAT.count,
    },
    {
      labelId: 'candidate.dashboard.stats.matchingScore',
      value: s?.bestMatchScore ?? 0,
      format: STAT_FORMAT.percent,
    },
    {
      labelId: 'candidate.dashboard.stats.interviews',
      value: s?.interviewCount ?? 0,
      format: STAT_FORMAT.count,
    },
    {
      labelId: 'candidate.dashboard.stats.goals',
      value: doneGoals,
      total: totalGoals,
      format: STAT_FORMAT.ratio,
    },
    {
      labelId: 'candidate.dashboard.stats.formations',
      value: s?.attendedWorkshopCount ?? 0,
      format: STAT_FORMAT.count,
    },
  ]

  const goals: GoalItem[] = DASHBOARD_GOALS.map(({ labelId, key }) => {
    const goal = goalsByKey.get(key)
    return { labelId, progress: goalProgress(goal?.done ?? false, goal?.progress) }
  })

  const recentApplications = overview?.recentApplications ?? []

  return {
    stats,
    goals,
    quickLinks: QUICK_LINKS,
    recentApplications,
    hasApplications: recentApplications.length > 0,
    isAiEnabled: true,
  }
}
