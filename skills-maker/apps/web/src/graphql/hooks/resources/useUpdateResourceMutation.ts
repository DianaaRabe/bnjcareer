import { useMutation, type MutationHookOptions } from '@apollo/client'
import type { UpdateResourceMutation, UpdateResourceMutationVariables } from '@/gql/graphql'
import { UPDATE_RESOURCE_MUTATION } from '@/graphql/mutations/resources'

export function useUpdateResourceMutation(
  options?: MutationHookOptions<UpdateResourceMutation, UpdateResourceMutationVariables>,
) {
  return useMutation(UPDATE_RESOURCE_MUTATION, options)
}
