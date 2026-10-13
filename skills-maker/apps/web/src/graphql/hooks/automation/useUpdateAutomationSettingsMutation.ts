import { useMutation, type MutationHookOptions } from '@apollo/client'
import type {
  UpdateAutomationSettingsMutation,
  UpdateAutomationSettingsMutationVariables,
} from '@/gql/graphql'
import { UPDATE_AUTOMATION_SETTINGS_MUTATION } from '@/graphql/mutations/automation'

export function useUpdateAutomationSettingsMutation(
  options?: MutationHookOptions<UpdateAutomationSettingsMutation, UpdateAutomationSettingsMutationVariables>,
) {
  return useMutation(UPDATE_AUTOMATION_SETTINGS_MUTATION, options)
}
