import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { MySessionQuery, MySessionQueryVariables } from '@/gql/graphql'
import { MY_SESSION_QUERY } from '@/graphql/queries/sessions'

export function useMySessionQuery(options?: QueryHookOptions<MySessionQuery, MySessionQueryVariables>) {
  return useQuery(MY_SESSION_QUERY, options)
}
