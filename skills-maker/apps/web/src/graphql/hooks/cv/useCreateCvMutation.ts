import { useMutation } from '@apollo/client'
import { CREATE_CV_MUTATION } from '@/graphql/mutations/cv'

export function useCreateCvMutation() {
  return useMutation(CREATE_CV_MUTATION)
}
