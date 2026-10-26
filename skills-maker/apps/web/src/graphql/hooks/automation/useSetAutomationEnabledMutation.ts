import { useMutation, type MutationHookOptions } from '@apollo/client'
import type {
  SetAutomationEnabledMutation,
  SetAutomationEnabledMutationVariables,
} from '@/gql/graphql'
import { SET_AUTOMATION_ENABLED_MUTATION } from '@/graphql/mutations/automation'

export function useSetAutomationEnabledMutation(
  options?: MutationHookOptions<SetAutomationEnabledMutation, SetAutomationEnabledMutationVariables>,
) {
  return useMutation(SET_AUTOMATION_ENABLED_MUTATION, options)
}
