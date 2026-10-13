import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { MyApplicationStatsQuery, MyApplicationStatsQueryVariables } from '@/gql/graphql'
import { MY_APPLICATION_STATS_QUERY } from '@/graphql/queries/applications'

export function useMyApplicationStatsQuery(
  options?: QueryHookOptions<MyApplicationStatsQuery, MyApplicationStatsQueryVariables>,
) {
  return useQuery(MY_APPLICATION_STATS_QUERY, options)
}
