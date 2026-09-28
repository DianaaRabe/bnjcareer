import { useMutation } from '@apollo/client'
import { UPDATE_CV_DETAILS_MUTATION } from '@/graphql/mutations/cv'

export function useUpdateCvDetailsMutation() {
  return useMutation(UPDATE_CV_DETAILS_MUTATION)
}
