import { useMutation, type MutationHookOptions } from '@apollo/client'
import type {
  TriggerMyAutomationRunMutation,
  TriggerMyAutomationRunMutationVariables,
} from '@/gql/graphql'
import { TRIGGER_MY_AUTOMATION_RUN_MUTATION } from '@/graphql/mutations/automation'

export function useTriggerMyAutomationRunMutation(
  options?: MutationHookOptions<TriggerMyAutomationRunMutation, TriggerMyAutomationRunMutationVariables>,
) {
  return useMutation(TRIGGER_MY_AUTOMATION_RUN_MUTATION, options)
}
