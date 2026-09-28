import { useMutation, type MutationHookOptions } from '@apollo/client'
import type { UpdateTrainingMutation, UpdateTrainingMutationVariables } from '@/gql/graphql'
import { UPDATE_TRAINING_MUTATION } from '@/graphql/mutations/trainings'

export function useUpdateTrainingMutation(
  options?: MutationHookOptions<UpdateTrainingMutation, UpdateTrainingMutationVariables>,
) {
  return useMutation(UPDATE_TRAINING_MUTATION, options)
}
