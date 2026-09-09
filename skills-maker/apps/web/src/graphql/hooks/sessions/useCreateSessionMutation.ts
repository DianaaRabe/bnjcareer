import { useMutation, type MutationHookOptions } from '@apollo/client'
import type { CreateSessionMutation, CreateSessionMutationVariables } from '@/gql/graphql'
import { CREATE_SESSION_MUTATION } from '@/graphql/mutations/sessions'

export function useCreateSessionMutation(
  options?: MutationHookOptions<CreateSessionMutation, CreateSessionMutationVariables>,
) {
  return useMutation(CREATE_SESSION_MUTATION, options)
}
