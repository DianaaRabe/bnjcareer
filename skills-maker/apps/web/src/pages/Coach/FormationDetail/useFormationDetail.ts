import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { TrainingCategory, TrainingLevel } from '@/gql/graphql'
import { useDeleteTrainingMutation, useMyTrainingQuery, useUpdateTrainingMutation } from '@/graphql/hooks/trainings'
import { MY_TRAININGS_QUERY } from '@/graphql/queries/trainings'
import { getGraphQLErrorCode } from '@/lib/apollo'
import { FORMATION_ERROR_MESSAGE_IDS } from './constants'

export const useFormationDetail = () => {
  const { trainingId } = useParams<{ trainingId: string }>()
  const navigate = useNavigate()

  const { data, loading, error, refetch } = useMyTrainingQuery({
    variables: { id: trainingId ?? '' },
    skip: !trainingId,
  })
  const [updateTraining, { loading: isSaving }] = useUpdateTrainingMutation()
  const [deleteTraining, { loading: isDeleting }] = useDeleteTrainingMutation()

  const training = data?.myTraining ?? null

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TrainingCategory | ''>('')
  const [level, setLevel] = useState<TrainingLevel | ''>('')
  const [durationDays, setDurationDays] = useState(1)
  const [priceCents, setPriceCents] = useState('')
  const [instructor, setInstructor] = useState('')
  const [certificate, setCertificate] = useState(false)
  const [saveErrorMessageId, setSaveErrorMessageId] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)

  // Re-seed the form only when a different training loads — never overwrite in-progress edits.
  useEffect(() => {
    if (!training) return
    setTitle(training.title)
    setDescription(training.description ?? '')
    setCategory(training.category)
    setLevel(training.level)
    setDurationDays(training.durationDays)
    setPriceCents(training.priceCents != null ? String(training.priceCents) : '')
    setInstructor(training.instructor ?? '')
    setCertificate(training.certificate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [training?.id])

  const code = error?.graphQLErrors[0]?.extensions?.code
  const loadErrorMessageId = error
    ? (FORMATION_ERROR_MESSAGE_IDS[String(code)] ?? FORMATION_ERROR_MESSAGE_IDS.default)
    : null

  const canSave = title.trim().length > 0 && Boolean(category) && Boolean(level) && durationDays >= 1 && !isSaving

  const save = async () => {
    if (!training || !category || !level || !canSave) return

    setSaveErrorMessageId(null)
    setJustSaved(false)

    try {
      await updateTraining({
        variables: {
          id: training.id,
          input: {
            title: title.trim(),
            description: description.trim() || null,
            category,
            level,
            durationDays,
            priceCents: priceCents.trim() ? Number(priceCents) : null,
            instructor: instructor.trim() || null,
            certificate,
          },
        },
      })
      setJustSaved(true)
    } catch (err) {
      const saveCode = getGraphQLErrorCode(err)
      setSaveErrorMessageId(FORMATION_ERROR_MESSAGE_IDS[String(saveCode)] ?? FORMATION_ERROR_MESSAGE_IDS.default)
    }
  }

  const togglePublished = async () => {
    if (!training) return
    await updateTraining({ variables: { id: training.id, input: { published: !training.published } } })
  }

  const remove = async () => {
    if (!training) return
    await deleteTraining({
      variables: { id: training.id },
      refetchQueries: [{ query: MY_TRAININGS_QUERY }],
      awaitRefetchQueries: true,
    })
    navigate(ROUTES.coach.formations, { replace: true })
  }

  return {
    training,
    isLoading: loading,
    loadErrorMessageId,
    title,
    setTitle,
    description,
    setDescription,
    category,
    setCategory,
    level,
    setLevel,
    durationDays,
    setDurationDays,
    priceCents,
    setPriceCents,
    instructor,
    setInstructor,
    certificate,
    setCertificate,
    canSave,
    isSaving,
    saveErrorMessageId,
    justSaved,
    save: () => void save(),
    togglePublished: () => void togglePublished(),
    isDeleting,
    remove: () => void remove(),
    retry: () => void refetch(),
  }
}
