import { useMutation, type MutationHookOptions } from '@apollo/client'
import type { UpdateTrainingModuleMutation, UpdateTrainingModuleMutationVariables } from '@/gql/graphql'
import { UPDATE_TRAINING_MODULE_MUTATION } from '@/graphql/mutations/trainings'

export function useUpdateTrainingModuleMutation(
  options?: MutationHookOptions<UpdateTrainingModuleMutation, UpdateTrainingModuleMutationVariables>,
) {
  return useMutation(UPDATE_TRAINING_MODULE_MUTATION, options)
}
