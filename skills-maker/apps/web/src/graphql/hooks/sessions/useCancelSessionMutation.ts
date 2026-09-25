import { useMutation, type MutationHookOptions } from '@apollo/client'
import type { CancelSessionMutation, CancelSessionMutationVariables } from '@/gql/graphql'
import { CANCEL_SESSION_MUTATION } from '@/graphql/mutations/sessions'

export function useCancelSessionMutation(
  options?: MutationHookOptions<CancelSessionMutation, CancelSessionMutationVariables>,
) {
  return useMutation(CANCEL_SESSION_MUTATION, options)
}
