import { useMutation, type MutationHookOptions } from '@apollo/client'
import type { UpdateCoachProfileMutation, UpdateCoachProfileMutationVariables } from '@/gql/graphql'
import { UPDATE_COACH_PROFILE_MUTATION } from '@/graphql/mutations/coaches'

export function useUpdateCoachProfileMutation(
  options?: MutationHookOptions<UpdateCoachProfileMutation, UpdateCoachProfileMutationVariables>,
) {
  return useMutation(UPDATE_COACH_PROFILE_MUTATION, options)
}
