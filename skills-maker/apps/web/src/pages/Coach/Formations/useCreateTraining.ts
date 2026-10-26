import { useState } from 'react'

import { TrainingCategory, TrainingLevel } from '@/gql/graphql'
import { useCreateTrainingMutation } from '@/graphql/hooks/trainings'
import { MY_TRAININGS_QUERY } from '@/graphql/queries/trainings'
import { getGraphQLErrorCode } from '@/lib/apollo'
import { CREATE_TRAINING_ERROR_MESSAGE_IDS, MIN_DURATION_DAYS } from './constants'

export const useCreateTraining = (onCreated: (id: string) => void) => {
  const [create, { loading: isCreating }] = useCreateTrainingMutation()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<TrainingCategory | ''>('')
  const [level, setLevel] = useState<TrainingLevel | ''>('')
  const [durationDays, setDurationDays] = useState(MIN_DURATION_DAYS)
  const [errorMessageId, setErrorMessageId] = useState<string | null>(null)

  const canSubmit =
    title.trim().length > 0 && Boolean(category) && Boolean(level) && durationDays >= MIN_DURATION_DAYS && !isCreating

  const reset = () => {
    setTitle('')
    setCategory('')
    setLevel('')
    setDurationDays(MIN_DURATION_DAYS)
    setErrorMessageId(null)
  }

  const submit = async () => {
    if (!canSubmit || !category || !level) return

    setErrorMessageId(null)

    try {
      const { data } = await create({
        variables: { input: { title: title.trim(), category, level, durationDays } },
        refetchQueries: [{ query: MY_TRAININGS_QUERY }],
      })
      if (data) {
        const createdId = data.createTraining.id
        reset()
        onCreated(createdId)
      }
    } catch (err) {
      const code = getGraphQLErrorCode(err)
      setErrorMessageId(CREATE_TRAINING_ERROR_MESSAGE_IDS[String(code)] ?? CREATE_TRAINING_ERROR_MESSAGE_IDS.default)
    }
  }

  return {
    title,
    setTitle,
    category,
    setCategory,
    level,
    setLevel,
    durationDays,
    setDurationDays,
    canSubmit,
    isCreating,
    errorMessageId,
    reset,
    submit: () => void submit(),
  }
}
