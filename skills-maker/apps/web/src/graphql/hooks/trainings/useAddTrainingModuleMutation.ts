import { useMutation, type MutationHookOptions } from '@apollo/client'
import type { AddTrainingModuleMutation, AddTrainingModuleMutationVariables } from '@/gql/graphql'
import { ADD_TRAINING_MODULE_MUTATION } from '@/graphql/mutations/trainings'

export function useAddTrainingModuleMutation(
  options?: MutationHookOptions<AddTrainingModuleMutation, AddTrainingModuleMutationVariables>,
) {
  return useMutation(ADD_TRAINING_MODULE_MUTATION, options)
}
