import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { MyPreparedApplicationsQuery, MyPreparedApplicationsQueryVariables } from '@/gql/graphql'
import { MY_PREPARED_APPLICATIONS_QUERY } from '@/graphql/queries/automation'

export function useMyPreparedApplicationsQuery(
  options?: QueryHookOptions<MyPreparedApplicationsQuery, MyPreparedApplicationsQueryVariables>,
) {
  return useQuery(MY_PREPARED_APPLICATIONS_QUERY, options)
}
