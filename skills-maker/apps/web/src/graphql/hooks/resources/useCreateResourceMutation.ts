import { useMutation, type MutationHookOptions } from '@apollo/client'
import type { CreateResourceMutation, CreateResourceMutationVariables } from '@/gql/graphql'
import { CREATE_RESOURCE_MUTATION } from '@/graphql/mutations/resources'

export function useCreateResourceMutation(
  options?: MutationHookOptions<CreateResourceMutation, CreateResourceMutationVariables>,
) {
  return useMutation(CREATE_RESOURCE_MUTATION, options)
}
