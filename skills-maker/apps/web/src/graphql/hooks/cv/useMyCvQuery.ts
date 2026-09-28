import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { MyCvQuery, MyCvQueryVariables } from '@/gql/graphql'
import { MY_CV_QUERY } from '@/graphql/queries/cv'

export function useMyCvQuery(options?: QueryHookOptions<MyCvQuery, MyCvQueryVariables>) {
  return useQuery(MY_CV_QUERY, options)
}
