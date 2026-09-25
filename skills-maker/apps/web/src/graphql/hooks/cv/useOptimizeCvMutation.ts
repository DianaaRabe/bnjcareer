import { useMutation } from '@apollo/client'
import { OPTIMIZE_CV_MUTATION } from '@/graphql/mutations/cv'

export function useOptimizeCvMutation() {
  return useMutation(OPTIMIZE_CV_MUTATION)
}
