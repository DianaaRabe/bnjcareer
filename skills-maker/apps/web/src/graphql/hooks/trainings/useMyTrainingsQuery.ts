import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { MyTrainingsQuery, MyTrainingsQueryVariables } from '@/gql/graphql'
import { MY_TRAININGS_QUERY } from '@/graphql/queries/trainings'

export function useMyTrainingsQuery(
  options?: QueryHookOptions<MyTrainingsQuery, MyTrainingsQueryVariables>,
) {
  return useQuery(MY_TRAININGS_QUERY, options)
}
