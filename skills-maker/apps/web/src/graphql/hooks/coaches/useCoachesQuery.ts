import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { CoachesQuery, CoachesQueryVariables } from '@/gql/graphql'
import { COACHES_QUERY } from '@/graphql/queries/coaches'

export function useCoachesQuery(options?: QueryHookOptions<CoachesQuery, CoachesQueryVariables>) {
  return useQuery(COACHES_QUERY, options)
}
