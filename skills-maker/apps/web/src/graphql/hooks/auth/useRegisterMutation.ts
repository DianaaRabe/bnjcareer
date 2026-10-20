import { useMutation } from '@apollo/client'
import { REGISTER_MUTATION } from '@/graphql/mutations/auth'

export function useRegisterMutation() {
  return useMutation(REGISTER_MUTATION)
}
