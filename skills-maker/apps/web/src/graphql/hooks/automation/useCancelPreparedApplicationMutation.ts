import { useMutation, type MutationHookOptions } from '@apollo/client'
import type {
  CancelPreparedApplicationMutation,
  CancelPreparedApplicationMutationVariables,
} from '@/gql/graphql'
import { CANCEL_PREPARED_APPLICATION_MUTATION } from '@/graphql/mutations/automation'

export function useCancelPreparedApplicationMutation(
  options?: MutationHookOptions<CancelPreparedApplicationMutation, CancelPreparedApplicationMutationVariables>,
) {
  return useMutation(CANCEL_PREPARED_APPLICATION_MUTATION, options)
}
