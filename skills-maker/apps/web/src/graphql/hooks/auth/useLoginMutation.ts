import { useMutation } from '@apollo/client'
import { LOGIN_MUTATION } from '@/graphql/mutations/auth'

export function useLoginMutation() {
  return useMutation(LOGIN_MUTATION)
}
