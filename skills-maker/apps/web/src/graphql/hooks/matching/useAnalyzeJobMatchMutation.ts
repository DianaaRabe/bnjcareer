import { useMutation } from '@apollo/client'
import { ANALYZE_JOB_MATCH_MUTATION } from '@/graphql/mutations/matching'

export function useAnalyzeJobMatchMutation() {
  return useMutation(ANALYZE_JOB_MATCH_MUTATION)
}
