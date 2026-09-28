import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { TrainingsQuery, TrainingsQueryVariables } from '@/gql/graphql'
import { TRAININGS_QUERY } from '@/graphql/queries/trainings'

export function useTrainingsQuery(
  options?: QueryHookOptions<TrainingsQuery, TrainingsQueryVariables>,
) {
  return useQuery(TRAININGS_QUERY, options)
}
