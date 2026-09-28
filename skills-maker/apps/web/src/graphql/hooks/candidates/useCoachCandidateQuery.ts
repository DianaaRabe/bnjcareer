import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { CoachCandidateQuery, CoachCandidateQueryVariables } from '@/gql/graphql'
import { COACH_CANDIDATE_QUERY } from '@/graphql/queries/candidates'

export function useCoachCandidateQuery(
  options?: QueryHookOptions<CoachCandidateQuery, CoachCandidateQueryVariables>,
) {
  return useQuery(COACH_CANDIDATE_QUERY, options)
}
