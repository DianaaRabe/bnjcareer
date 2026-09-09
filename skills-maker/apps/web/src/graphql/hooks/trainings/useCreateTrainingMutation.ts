import { useMutation, type MutationHookOptions } from '@apollo/client'
import type { CreateTrainingMutation, CreateTrainingMutationVariables } from '@/gql/graphql'
import { CREATE_TRAINING_MUTATION } from '@/graphql/mutations/trainings'

export function useCreateTrainingMutation(
  options?: MutationHookOptions<CreateTrainingMutation, CreateTrainingMutationVariables>,
) {
  return useMutation(CREATE_TRAINING_MUTATION, options)
}
