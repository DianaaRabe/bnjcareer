import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { MyCandidatesQuery, MyCandidatesQueryVariables } from '@/gql/graphql'
import { MY_CANDIDATES_QUERY } from '@/graphql/queries/candidates'

export function useMyCandidatesQuery(
  options?: QueryHookOptions<MyCandidatesQuery, MyCandidatesQueryVariables>,
) {
  return useQuery(MY_CANDIDATES_QUERY, options)
}
