import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { MyCoachingQuery, MyCoachingQueryVariables } from '@/gql/graphql'
import { MY_COACHING_QUERY } from '@/graphql/queries/coaching'

export function useMyCoachingQuery(
  options?: QueryHookOptions<MyCoachingQuery, MyCoachingQueryVariables>,
) {
  return useQuery(MY_COACHING_QUERY, options)
}
