import { useMutation, type MutationHookOptions } from '@apollo/client'
import type { RemoveTrainingModuleMutation, RemoveTrainingModuleMutationVariables } from '@/gql/graphql'
import { REMOVE_TRAINING_MODULE_MUTATION } from '@/graphql/mutations/trainings'

export function useRemoveTrainingModuleMutation(
  options?: MutationHookOptions<RemoveTrainingModuleMutation, RemoveTrainingModuleMutationVariables>,
) {
  return useMutation(REMOVE_TRAINING_MODULE_MUTATION, options)
}
