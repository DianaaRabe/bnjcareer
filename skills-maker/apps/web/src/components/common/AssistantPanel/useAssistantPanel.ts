import { useCallback, useRef, useState } from 'react'

import { AssistantRole, type AssistantMessageInput } from '@/gql/graphql'
import { useAssistantStream } from '@/graphql/hooks/assistant'

export type ChatMessage = {
  id: string
  role: AssistantRole
  content: string
}

export const SUGGESTION_IDS = [
  'assistant.suggestion.cv',
  'assistant.suggestion.interview',
  'assistant.suggestion.salary',
]

const toHistory = (messages: ChatMessage[]): AssistantMessageInput[] =>
  messages.map(({ role, content }) => ({ role, content }))

export const useAssistantPanel = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [hasError, setHasError] = useState(false)
  const replyIdRef = useRef('')

  const replaceReply = useCallback(
    (content: string) =>
      setMessages((current) =>
        current.map((message) =>
          message.id === replyIdRef.current ? { ...message, content } : message,
        ),
      ),
    [],
  )

  /**
   * A failed turn leaves no trace in the history: its empty bubble is dropped, so the next
   * question is not sent with a blank — or worse, an error message — as the assistant's turn.
   */
  const dropPendingReply = useCallback(
    () =>
      setMessages((current) => current.filter((message) => message.id !== replyIdRef.current)),
    [],
  )

  const { ask, stop, isStreaming } = useAssistantStream({
    onDelta: replaceReply,
    onDone: () => undefined,
    onError: () => {
      dropPendingReply()
      setHasError(true)
    },
  })

  const askQuestion = useCallback(
    (question: string, history: ChatMessage[]) => {
      const askedAt = Date.now()
      const userMessage: ChatMessage = {
        id: `user-${askedAt}`,
        role: AssistantRole.User,
        content: question,
      }
      const replyId = `assistant-${askedAt}`
      replyIdRef.current = replyId

      const asked = [...history, userMessage]
      setMessages([...asked, { id: replyId, role: AssistantRole.Assistant, content: '' }])
      setHasError(false)

      ask(toHistory(asked))
    },
    [ask],
  )

  const send = useCallback(() => {
    const question = draft.trim()
    if (!question || isStreaming) return

    setDraft('')
    askQuestion(question, messages)
  }, [askQuestion, draft, isStreaming, messages])

  /** Re-sends the last question, which is still the final entry once its reply was dropped. */
  const retry = useCallback(() => {
    const lastQuestion = messages[messages.length - 1]
    if (!lastQuestion || lastQuestion.role !== AssistantRole.User) return

    askQuestion(lastQuestion.content, messages.slice(0, -1))
  }, [askQuestion, messages])

  const reset = useCallback(() => {
    stop()
    setMessages([])
    setDraft('')
    setHasError(false)
  }, [stop])

  return {
    messages,
    draft,
    setDraft,
    send,
    retry,
    reset,
    stop,
    isStreaming,
    hasError,
    canRetry: messages[messages.length - 1]?.role === AssistantRole.User,
    suggestions: SUGGESTION_IDS,
  }
}
