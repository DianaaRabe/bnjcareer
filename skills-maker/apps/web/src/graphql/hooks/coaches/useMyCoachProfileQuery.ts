import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { MyCoachProfileQuery, MyCoachProfileQueryVariables } from '@/gql/graphql'
import { MY_COACH_PROFILE_QUERY } from '@/graphql/queries/coaches'

export function useMyCoachProfileQuery(
  options?: QueryHookOptions<MyCoachProfileQuery, MyCoachProfileQueryVariables>,
) {
  return useQuery(MY_COACH_PROFILE_QUERY, options)
}
