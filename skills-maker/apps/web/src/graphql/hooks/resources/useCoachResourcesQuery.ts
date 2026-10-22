import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { CoachResourcesQuery, CoachResourcesQueryVariables } from '@/gql/graphql'
import { COACH_RESOURCES_QUERY } from '@/graphql/queries/resources'

export function useCoachResourcesQuery(
  options?: QueryHookOptions<CoachResourcesQuery, CoachResourcesQueryVariables>,
) {
  return useQuery(COACH_RESOURCES_QUERY, options)
}
