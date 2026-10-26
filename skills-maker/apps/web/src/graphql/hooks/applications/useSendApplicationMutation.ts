import { useMutation, type MutationHookOptions } from '@apollo/client'
import type { SendApplicationMutation, SendApplicationMutationVariables } from '@/gql/graphql'
import { SEND_APPLICATION_MUTATION } from '@/graphql/mutations/applications'

export function useSendApplicationMutation(
  options?: MutationHookOptions<SendApplicationMutation, SendApplicationMutationVariables>,
) {
  return useMutation(SEND_APPLICATION_MUTATION, options)
}
