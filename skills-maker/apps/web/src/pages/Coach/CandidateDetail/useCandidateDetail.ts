import { useParams } from 'react-router-dom'

import { useCoachCandidateQuery } from '@/graphql/hooks/candidates'
import type { CoachCandidateQuery } from '@/gql/graphql'
import { CANDIDATE_ERROR_MESSAGE_IDS } from './constants'

export type CandidateDetail = NonNullable<CoachCandidateQuery['coachCandidate']>

export const useCandidateDetail = () => {
  const { candidateId } = useParams<{ candidateId: string }>()

  const { data, loading, error, refetch } = useCoachCandidateQuery({
    variables: { id: candidateId ?? '' },
    skip: !candidateId,
  })

  const code = error?.graphQLErrors[0]?.extensions?.code
  const errorMessageId = error
    ? (CANDIDATE_ERROR_MESSAGE_IDS[String(code)] ?? CANDIDATE_ERROR_MESSAGE_IDS.default)
    : null

  return {
    candidate: data?.coachCandidate ?? null,
    isLoading: loading,
    errorMessageId,
    retry: () => void refetch(),
  }
}
