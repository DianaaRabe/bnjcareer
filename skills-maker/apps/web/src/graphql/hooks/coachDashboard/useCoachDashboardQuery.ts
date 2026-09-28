import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { CoachDashboardQuery, CoachDashboardQueryVariables } from '@/gql/graphql'
import { COACH_DASHBOARD_QUERY } from '@/graphql/queries/coachDashboard'

export function useCoachDashboardQuery(
  options?: QueryHookOptions<CoachDashboardQuery, CoachDashboardQueryVariables>,
) {
  return useQuery(COACH_DASHBOARD_QUERY, options)
}
