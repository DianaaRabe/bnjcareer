import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { EventType } from '@/gql/graphql'
import {
  useCancelBookingMutation,
  useCancelSessionMutation,
  useMySessionQuery,
  useUpdateSessionMutation,
} from '@/graphql/hooks/sessions'
import { MY_SESSIONS_QUERY, MY_SESSION_QUERY } from '@/graphql/queries/sessions'
import { getGraphQLErrorCode } from '@/lib/apollo'
import { SESSION_ERROR_MESSAGE_IDS } from './constants'

/** Local "YYYY-MM-DDTHH:mm" value a datetime-local input expects, from an ISO datetime. */
const toDatetimeLocalValue = (iso: string) => {
  const date = new Date(iso)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export const useSessionDetail = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const { data, loading, error, refetch } = useMySessionQuery({
    variables: { id: sessionId ?? '' },
    skip: !sessionId,
  })
  const [updateSession, { loading: isSaving }] = useUpdateSessionMutation()
  const [cancelSession, { loading: isCanceling }] = useCancelSessionMutation()
  const [cancelBooking, { loading: isCancelingBooking }] = useCancelBookingMutation()

  const session = data?.mySession ?? null

  const [title, setTitle] = useState('')
  const [type, setType] = useState<EventType | ''>('')
  const [startAt, setStartAt] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [saveErrorMessageId, setSaveErrorMessageId] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)

  // Re-seed the form only when a different session loads — never overwrite in-progress edits.
  useEffect(() => {
    if (!session) return
    setTitle(session.title)
    setType(session.type)
    setStartAt(toDatetimeLocalValue(session.startTime))
    setDurationMinutes(
      Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60_000),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id])

  const code = error?.graphQLErrors[0]?.extensions?.code
  const loadErrorMessageId = error ? (SESSION_ERROR_MESSAGE_IDS[String(code)] ?? SESSION_ERROR_MESSAGE_IDS.default) : null

  const canSave = title.trim().length > 0 && Boolean(type) && Boolean(startAt) && durationMinutes > 0 && !isSaving

  const save = async () => {
    if (!session || !type || !canSave) return

    const start = new Date(startAt)
    const end = new Date(start.getTime() + durationMinutes * 60_000)

    setSaveErrorMessageId(null)
    setJustSaved(false)

    try {
      await updateSession({
        variables: {
          id: session.id,
          input: { title: title.trim(), type, startTime: start.toISOString(), endTime: end.toISOString() },
        },
      })
      setJustSaved(true)
    } catch (err) {
      const saveCode = getGraphQLErrorCode(err)
      setSaveErrorMessageId(SESSION_ERROR_MESSAGE_IDS[String(saveCode)] ?? SESSION_ERROR_MESSAGE_IDS.default)
    }
  }

  const cancel = async () => {
    if (!session) return
    await cancelSession({
      variables: { id: session.id },
      refetchQueries: [{ query: MY_SESSIONS_QUERY }],
      awaitRefetchQueries: true,
    })
    navigate(ROUTES.coach.sessions, { replace: true })
  }

  const removeAttendee = async (bookingId: string) => {
    await cancelBooking({
      variables: { id: bookingId },
      refetchQueries: [{ query: MY_SESSION_QUERY, variables: { id: sessionId ?? '' } }],
      awaitRefetchQueries: true,
    })
  }

  return {
    session,
    isLoading: loading,
    loadErrorMessageId,
    title,
    setTitle,
    type,
    setType,
    startAt,
    setStartAt,
    durationMinutes,
    setDurationMinutes,
    canSave,
    isSaving,
    saveErrorMessageId,
    justSaved,
    save: () => void save(),
    isCanceling,
    cancel: () => void cancel(),
    isCancelingBooking,
    removeAttendee: (bookingId: string) => void removeAttendee(bookingId),
    retry: () => void refetch(),
  }
}
