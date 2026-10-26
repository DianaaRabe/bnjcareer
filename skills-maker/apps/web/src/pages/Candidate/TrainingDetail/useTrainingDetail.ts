import { useParams } from 'react-router-dom'

import { useTrainingQuery } from '@/graphql/hooks/trainings'
import type { TrainingQuery } from '@/gql/graphql'
import { TRAINING_ERROR_MESSAGE_IDS } from './constants'

export type TrainingDetail = NonNullable<TrainingQuery['training']>
export type CurriculumModule = TrainingDetail['curriculum'][number]

export const useTrainingDetail = () => {
  const { trainingId } = useParams<{ trainingId: string }>()

  const { data, loading, error, refetch } = useTrainingQuery({
    variables: { id: trainingId ?? '' },
    skip: !trainingId,
  })

  const code = error?.graphQLErrors[0]?.extensions?.code
  const errorMessageId = error
    ? (TRAINING_ERROR_MESSAGE_IDS[String(code)] ?? TRAINING_ERROR_MESSAGE_IDS.default)
    : null

  return {
    training: data?.training ?? null,
    isLoading: loading,
    errorMessageId,
    retry: () => void refetch(),
  }
}
