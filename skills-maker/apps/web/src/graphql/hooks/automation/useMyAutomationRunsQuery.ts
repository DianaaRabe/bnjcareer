import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { MyAutomationRunsQuery, MyAutomationRunsQueryVariables } from '@/gql/graphql'
import { MY_AUTOMATION_RUNS_QUERY } from '@/graphql/queries/automation'

export function useMyAutomationRunsQuery(
  options?: QueryHookOptions<MyAutomationRunsQuery, MyAutomationRunsQueryVariables>,
) {
  return useQuery(MY_AUTOMATION_RUNS_QUERY, options)
}
