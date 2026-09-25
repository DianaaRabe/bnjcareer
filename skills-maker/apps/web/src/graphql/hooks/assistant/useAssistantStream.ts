import { useCallback, useRef, useState } from 'react'
import { useApolloClient } from '@apollo/client'

import { AssistantRole, type AssistantMessageInput } from '@/gql/graphql'
import { ASSISTANT_REPLY_SUBSCRIPTION } from '@/graphql/subscriptions'

type UseAssistantStreamArgs = {
  /** Called for every delta, with the answer accumulated so far. */
  onDelta: (text: string) => void
  onDone: () => void
  onError: () => void
}

/**
 * Drives one assistant answer over the subscription. Apollo delivers execution errors in the
 * `errors` field of a payload rather than the error callback, so both paths are handled.
 */
export function useAssistantStream({ onDelta, onDone, onError }: UseAssistantStreamArgs) {
  const client = useApolloClient()
  const [isStreaming, setStreaming] = useState(false)
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)

  const stop = useCallback(() => {
    subscriptionRef.current?.unsubscribe()
    subscriptionRef.current = null
    setStreaming(false)
  }, [])

  const ask = useCallback(
    (messages: AssistantMessageInput[]) => {
      stop()
      setStreaming(true)

      let answer = ''

      subscriptionRef.current = client
        .subscribe({ query: ASSISTANT_REPLY_SUBSCRIPTION, variables: { input: { messages } } })
        .subscribe({
          next: ({ data, errors }) => {
            if (errors?.length) {
              stop()
              onError()
              return
            }

            const chunk = data?.assistantReply
            if (!chunk) return

            answer += chunk.delta
            onDelta(answer)

            if (chunk.done) {
              stop()
              onDone()
            }
          },
          error: () => {
            stop()
            onError()
          },
        })
    },
    [client, onDelta, onDone, onError, stop],
  )

  return { ask, stop, isStreaming }
}

export { AssistantRole }
