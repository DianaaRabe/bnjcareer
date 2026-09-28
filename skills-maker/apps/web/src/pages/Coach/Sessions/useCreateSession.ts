import { useState } from 'react'

import { EventType } from '@/gql/graphql'
import { useCreateSessionMutation } from '@/graphql/hooks/sessions'
import { MY_SESSIONS_QUERY } from '@/graphql/queries/sessions'
import { getGraphQLErrorCode } from '@/lib/apollo'
import { CREATE_SESSION_ERROR_MESSAGE_IDS, DEFAULT_DURATION_MINUTES } from './constants'

export const useCreateSession = (onCreated: (id: string) => void) => {
  const [create, { loading: isCreating }] = useCreateSessionMutation()

  const [title, setTitle] = useState('')
  const [type, setType] = useState<EventType | ''>('')
  const [startAt, setStartAt] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(DEFAULT_DURATION_MINUTES)
  const [errorMessageId, setErrorMessageId] = useState<string | null>(null)

  const canSubmit = title.trim().length > 0 && Boolean(type) && Boolean(startAt) && durationMinutes > 0 && !isCreating

  const reset = () => {
    setTitle('')
    setType('')
    setStartAt('')
    setDurationMinutes(DEFAULT_DURATION_MINUTES)
    setErrorMessageId(null)
  }

  const submit = async () => {
    if (!canSubmit || !type) return

    const start = new Date(startAt)
    const end = new Date(start.getTime() + durationMinutes * 60_000)

    setErrorMessageId(null)

    try {
      const { data } = await create({
        variables: {
          input: { title: title.trim(), type, startTime: start.toISOString(), endTime: end.toISOString() },
        },
        refetchQueries: [{ query: MY_SESSIONS_QUERY }],
      })
      if (data) {
        const createdId = data.createSession.id
        reset()
        onCreated(createdId)
      }
    } catch (err) {
      const code = getGraphQLErrorCode(err)
      setErrorMessageId(CREATE_SESSION_ERROR_MESSAGE_IDS[String(code)] ?? CREATE_SESSION_ERROR_MESSAGE_IDS.default)
    }
  }

  return {
    title,
    setTitle,
    type,
    setType,
    startAt,
    setStartAt,
    durationMinutes,
    setDurationMinutes,
    canSubmit,
    isCreating,
    errorMessageId,
    reset,
    submit: () => void submit(),
  }
}
