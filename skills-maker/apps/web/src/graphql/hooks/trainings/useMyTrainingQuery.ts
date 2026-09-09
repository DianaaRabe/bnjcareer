import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { MyTrainingQuery, MyTrainingQueryVariables } from '@/gql/graphql'
import { MY_TRAINING_QUERY } from '@/graphql/queries/trainings'

export function useMyTrainingQuery(
  options?: QueryHookOptions<MyTrainingQuery, MyTrainingQueryVariables>,
) {
  return useQuery(MY_TRAINING_QUERY, options)
}
