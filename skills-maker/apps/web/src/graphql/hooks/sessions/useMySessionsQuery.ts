import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { MySessionsQuery, MySessionsQueryVariables } from '@/gql/graphql'
import { MY_SESSIONS_QUERY } from '@/graphql/queries/sessions'

export function useMySessionsQuery(options?: QueryHookOptions<MySessionsQuery, MySessionsQueryVariables>) {
  return useQuery(MY_SESSIONS_QUERY, options)
}
