import { useState } from 'react'

import { ResourceCategory, ResourceType } from '@/gql/graphql'
import { useCreateResourceMutation } from '@/graphql/hooks/resources'
import { COACH_RESOURCES_QUERY } from '@/graphql/queries/resources'
import { getGraphQLErrorCode } from '@/lib/apollo'
import { CREATE_RESOURCE_ERROR_MESSAGE_IDS } from './constants'

export const useCreateResource = (onCreated: (id: string) => void) => {
  const [create, { loading: isCreating }] = useCreateResourceMutation()

  const [title, setTitle] = useState('')
  const [type, setType] = useState<ResourceType | ''>('')
  const [category, setCategory] = useState<ResourceCategory | ''>('')
  const [errorMessageId, setErrorMessageId] = useState<string | null>(null)

  const canSubmit = title.trim().length > 0 && Boolean(type) && Boolean(category) && !isCreating

  const reset = () => {
    setTitle('')
    setType('')
    setCategory('')
    setErrorMessageId(null)
  }

  const submit = async () => {
    if (!canSubmit || !type || !category) return

    setErrorMessageId(null)

    try {
      const { data } = await create({
        variables: { input: { title: title.trim(), type, category } },
        refetchQueries: [{ query: COACH_RESOURCES_QUERY }],
      })
      if (data) {
        const createdId = data.createResource.id
        reset()
        onCreated(createdId)
      }
    } catch (err) {
      const code = getGraphQLErrorCode(err)
      setErrorMessageId(CREATE_RESOURCE_ERROR_MESSAGE_IDS[String(code)] ?? CREATE_RESOURCE_ERROR_MESSAGE_IDS.default)
    }
  }

  return {
    title,
    setTitle,
    type,
    setType,
    category,
    setCategory,
    canSubmit,
    isCreating,
    errorMessageId,
    reset,
    submit: () => void submit(),
  }
}
