import { useMutation } from '@apollo/client'
import { AUTH_WITH_GOOGLE_MUTATION } from '@/graphql/mutations/auth'

export function useAuthWithGoogleMutation() {
  return useMutation(AUTH_WITH_GOOGLE_MUTATION)
}
