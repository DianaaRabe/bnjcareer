import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { MyProfileQuery, MyProfileQueryVariables } from '@/gql/graphql'
import { MY_PROFILE_QUERY } from '@/graphql/queries/profiles'

export function useMyProfileQuery(options?: QueryHookOptions<MyProfileQuery, MyProfileQueryVariables>) {
  return useQuery(MY_PROFILE_QUERY, options)
}
