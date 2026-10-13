import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { MyAutomationSettingsQuery, MyAutomationSettingsQueryVariables } from '@/gql/graphql'
import { MY_AUTOMATION_SETTINGS_QUERY } from '@/graphql/queries/automation'

export function useMyAutomationSettingsQuery(
  options?: QueryHookOptions<MyAutomationSettingsQuery, MyAutomationSettingsQueryVariables>,
) {
  return useQuery(MY_AUTOMATION_SETTINGS_QUERY, options)
}
