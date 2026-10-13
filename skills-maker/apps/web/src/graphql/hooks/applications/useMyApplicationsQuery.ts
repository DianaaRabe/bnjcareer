import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { MyApplicationsQuery, MyApplicationsQueryVariables } from '@/gql/graphql'
import { MY_APPLICATIONS_QUERY } from '@/graphql/queries/applications'

export function useMyApplicationsQuery(
  options?: QueryHookOptions<MyApplicationsQuery, MyApplicationsQueryVariables>,
) {
  return useQuery(MY_APPLICATIONS_QUERY, options)
}
