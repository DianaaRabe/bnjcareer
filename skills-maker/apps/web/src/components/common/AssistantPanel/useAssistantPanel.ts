import { useCallback, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import { AssistantRole, type AssistantMessageInput } from '@/gql/graphql'
import { useAssistantStream } from '@/graphql/hooks/assistant'

export type ChatMessage = {
  id: string
  role: AssistantRole
  content: string
}

/** Server history only — the greeting is local, it must not be sent back as context. */
const toHistory = (messages: ChatMessage[]): AssistantMessageInput[] =>
  messages.map(({ role, content }) => ({ role, content }))

export const useAssistantPanel = () => {
  const intl = useIntl()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [hasError, setHasError] = useState(false)
  const replyIdRef = useState(() => ({ current: '' }))[0]

  const replaceReply = useCallback(
    (content: string) =>
      setMessages((current) =>
        current.map((message) =>
          message.id === replyIdRef.current ? { ...message, content } : message,
        ),
      ),
    [replyIdRef],
  )

  const { ask, stop, isStreaming } = useAssistantStream({
    onDelta: replaceReply,
    onDone: () => undefined,
    onError: () => {
      setHasError(true)
      replaceReply(intl.formatMessage({ id: 'assistant.error' }))
    },
  })

  const send = useCallback(() => {
    const question = draft.trim()
    if (!question || isStreaming) return

    const askedAt = Date.now()
    const userMessage: ChatMessage = {
      id: `user-${askedAt}`,
      role: AssistantRole.User,
      content: question,
    }
    const replyId = `assistant-${askedAt}`
    replyIdRef.current = replyId

    const history = [...messages, userMessage]
    setMessages([...history, { id: replyId, role: AssistantRole.Assistant, content: '' }])
    setDraft('')
    setHasError(false)

    ask(toHistory(history))
  }, [ask, draft, isStreaming, messages, replyIdRef])

  const suggestions = useMemo(
    () => [
      'assistant.suggestion.cv',
      'assistant.suggestion.interview',
      'assistant.suggestion.salary',
    ],
    [],
  )

  return {
    messages,
    draft,
    setDraft,
    send,
    stop,
    isStreaming,
    hasError,
    suggestions,
    pickSuggestion: (labelId: string) => setDraft(intl.formatMessage({ id: labelId })),
  }
}
