import { useMemo } from 'react'

import type { QuickLink } from '@/components/common/QuickAccessCard/QuickAccessCard'
import { STAT_FORMAT, type StatItem } from '@/components/common/StatCard/StatCard'
import { ROUTES } from '@/constants/routes'
import { useCoachDashboardQuery } from '@/graphql/hooks/coachDashboard'
import type { CoachDashboardQuery } from '@/gql/graphql'

export type UpcomingSession = CoachDashboardQuery['coachDashboard']['upcomingSessions'][number]
export type RecentCandidate = CoachDashboardQuery['coachDashboard']['recentCandidates'][number]

const QUICK_LINKS: QuickLink[] = [
  {
    to: ROUTES.coach.formations,
    labelId: 'nav.coach.formations',
    descriptionId: 'coach.dashboard.quickAccess.formations.description',
  },
  {
    to: ROUTES.coach.sessions,
    labelId: 'nav.coach.sessions',
    descriptionId: 'coach.dashboard.quickAccess.sessions.description',
  },
  {
    to: ROUTES.coach.resources,
    labelId: 'nav.coach.resources',
    descriptionId: 'coach.dashboard.quickAccess.resources.description',
  },
]

export const useDashboard = () => {
  const { data, loading, error, refetch } = useCoachDashboardQuery()

  const overview = data?.coachDashboard

  const stats: StatItem[] = useMemo(
    () => [
      {
        labelId: 'coach.dashboard.stats.candidates',
        value: overview?.totalCandidates ?? 0,
        format: STAT_FORMAT.count,
      },
      {
        labelId: 'coach.dashboard.stats.sessionsThisWeek',
        value: overview?.sessionsThisWeek ?? 0,
        format: STAT_FORMAT.count,
      },
      {
        labelId: 'coach.dashboard.stats.upcomingSessions',
        value: overview?.upcomingSessionsCount ?? 0,
        format: STAT_FORMAT.count,
      },
    ],
    [overview],
  )

  return {
    stats,
    recentCandidates: overview?.recentCandidates ?? [],
    upcomingSessions: overview?.upcomingSessions ?? [],
    quickLinks: QUICK_LINKS,
    isLoading: loading,
    hasError: Boolean(error),
    retry: () => void refetch(),
  }
}
