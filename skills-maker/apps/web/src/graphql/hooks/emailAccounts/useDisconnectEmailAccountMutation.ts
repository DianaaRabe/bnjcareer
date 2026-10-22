import { useMutation, type MutationHookOptions } from '@apollo/client'
import type {
  DisconnectEmailAccountMutation,
  DisconnectEmailAccountMutationVariables,
} from '@/gql/graphql'
import { DISCONNECT_EMAIL_ACCOUNT_MUTATION } from '@/graphql/mutations/emailAccounts'

export function useDisconnectEmailAccountMutation(
  options?: MutationHookOptions<DisconnectEmailAccountMutation, DisconnectEmailAccountMutationVariables>,
) {
  return useMutation(DISCONNECT_EMAIL_ACCOUNT_MUTATION, options)
}
