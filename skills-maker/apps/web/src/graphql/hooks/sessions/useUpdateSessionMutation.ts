import { useMutation, type MutationHookOptions } from '@apollo/client'
import type { UpdateSessionMutation, UpdateSessionMutationVariables } from '@/gql/graphql'
import { UPDATE_SESSION_MUTATION } from '@/graphql/mutations/sessions'

export function useUpdateSessionMutation(
  options?: MutationHookOptions<UpdateSessionMutation, UpdateSessionMutationVariables>,
) {
  return useMutation(UPDATE_SESSION_MUTATION, options)
}
