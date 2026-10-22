import { useState } from 'react'

import {
  useAddTrainingModuleMutation,
  useRemoveTrainingModuleMutation,
  useUpdateTrainingModuleMutation,
} from '@/graphql/hooks/trainings'
import { MY_TRAINING_QUERY } from '@/graphql/queries/trainings'
import { getGraphQLErrorCode } from '@/lib/apollo'
import { MODULE_ERROR_MESSAGE_IDS } from './constants'

export type ModuleInput = { title: string; summary: string; durationMinutes: string }

export const useCurriculumEditor = (trainingId: string) => {
  const [addModule, { loading: isAdding }] = useAddTrainingModuleMutation()
  const [updateModule] = useUpdateTrainingModuleMutation()
  const [removeModule] = useRemoveTrainingModuleMutation()

  const [newModule, setNewModule] = useState<ModuleInput>({ title: '', summary: '', durationMinutes: '' })
  const [errorMessageId, setErrorMessageId] = useState<string | null>(null)

  const refetchQueries = [{ query: MY_TRAINING_QUERY, variables: { id: trainingId } }]

  const toInputVariables = (input: ModuleInput) => ({
    title: input.title.trim(),
    summary: input.summary.trim() || null,
    durationMinutes: input.durationMinutes.trim() ? Number(input.durationMinutes) : null,
  })

  const addNewModule = async () => {
    if (!newModule.title.trim()) return

    setErrorMessageId(null)

    try {
      await addModule({
        variables: { trainingId, input: toInputVariables(newModule) },
        refetchQueries,
        awaitRefetchQueries: true,
      })
      setNewModule({ title: '', summary: '', durationMinutes: '' })
    } catch (err) {
      const code = getGraphQLErrorCode(err)
      setErrorMessageId(MODULE_ERROR_MESSAGE_IDS[String(code)] ?? MODULE_ERROR_MESSAGE_IDS.default)
    }
  }

  const renameModule = async (id: string, input: ModuleInput) => {
    setErrorMessageId(null)

    try {
      await updateModule({ variables: { id, input: toInputVariables(input) }, refetchQueries })
    } catch (err) {
      const code = getGraphQLErrorCode(err)
      setErrorMessageId(MODULE_ERROR_MESSAGE_IDS[String(code)] ?? MODULE_ERROR_MESSAGE_IDS.default)
    }
  }

  const deleteModule = async (id: string) => {
    await removeModule({ variables: { id }, refetchQueries, awaitRefetchQueries: true })
  }

  return {
    newModule,
    setNewModule,
    canAdd: newModule.title.trim().length > 0 && !isAdding,
    isAdding,
    errorMessageId,
    addNewModule: () => void addNewModule(),
    renameModule,
    deleteModule: (id: string) => void deleteModule(id),
  }
}
