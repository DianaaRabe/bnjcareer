import { useMutation } from '@apollo/client'
import { SET_CV_TEMPLATE_MUTATION } from '@/graphql/mutations/cv'

export function useSetCvTemplateMutation() {
  return useMutation(SET_CV_TEMPLATE_MUTATION)
}
