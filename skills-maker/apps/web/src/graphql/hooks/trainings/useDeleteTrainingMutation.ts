import { useMutation, type MutationHookOptions } from '@apollo/client'
import type { DeleteTrainingMutation, DeleteTrainingMutationVariables } from '@/gql/graphql'
import { DELETE_TRAINING_MUTATION } from '@/graphql/mutations/trainings'

export function useDeleteTrainingMutation(
  options?: MutationHookOptions<DeleteTrainingMutation, DeleteTrainingMutationVariables>,
) {
  return useMutation(DELETE_TRAINING_MUTATION, options)
}
