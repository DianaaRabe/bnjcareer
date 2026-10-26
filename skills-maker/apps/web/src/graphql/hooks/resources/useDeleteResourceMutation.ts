import { useMutation, type MutationHookOptions } from '@apollo/client'
import type { DeleteResourceMutation, DeleteResourceMutationVariables } from '@/gql/graphql'
import { DELETE_RESOURCE_MUTATION } from '@/graphql/mutations/resources'

export function useDeleteResourceMutation(
  options?: MutationHookOptions<DeleteResourceMutation, DeleteResourceMutationVariables>,
) {
  return useMutation(DELETE_RESOURCE_MUTATION, options)
}
