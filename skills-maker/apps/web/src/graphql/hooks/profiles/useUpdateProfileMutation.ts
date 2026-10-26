import { useMutation } from '@apollo/client'
import { UPDATE_PROFILE_MUTATION } from '@/graphql/mutations/profiles'

export function useUpdateProfileMutation() {
  return useMutation(UPDATE_PROFILE_MUTATION)
}
