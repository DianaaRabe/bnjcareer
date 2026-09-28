import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { TrainingQuery, TrainingQueryVariables } from '@/gql/graphql'
import { TRAINING_QUERY } from '@/graphql/queries/trainings'

export function useTrainingQuery(options: QueryHookOptions<TrainingQuery, TrainingQueryVariables>) {
  return useQuery(TRAINING_QUERY, options)
}
