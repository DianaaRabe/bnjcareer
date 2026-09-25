import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { CoachResourceQuery, CoachResourceQueryVariables } from '@/gql/graphql'
import { COACH_RESOURCE_QUERY } from '@/graphql/queries/resources'

export function useCoachResourceQuery(options?: QueryHookOptions<CoachResourceQuery, CoachResourceQueryVariables>) {
  return useQuery(COACH_RESOURCE_QUERY, options)
}
