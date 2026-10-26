import { useMutation, type MutationHookOptions } from '@apollo/client'
import type {
  ConnectEmailAccountMutation,
  ConnectEmailAccountMutationVariables,
} from '@/gql/graphql'
import { CONNECT_EMAIL_ACCOUNT_MUTATION } from '@/graphql/mutations/emailAccounts'

export function useConnectEmailAccountMutation(
  options?: MutationHookOptions<ConnectEmailAccountMutation, ConnectEmailAccountMutationVariables>,
) {
  return useMutation(CONNECT_EMAIL_ACCOUNT_MUTATION, options)
}
