import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { MeQuery, MeQueryVariables } from '@/gql/graphql'
import { ME_QUERY } from '@/graphql/queries/auth'

export function useMeQuery(options?: QueryHookOptions<MeQuery, MeQueryVariables>) {
  return useQuery(ME_QUERY, options)
}
