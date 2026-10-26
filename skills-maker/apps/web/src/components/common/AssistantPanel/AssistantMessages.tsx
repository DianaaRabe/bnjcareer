import { useEffect, useRef } from 'react'
import { Sparkles } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { AssistantRole } from '@/gql/graphql'
import { cn } from '@/lib/utils'
import type { ChatMessage } from './useAssistantPanel'

type AssistantMessagesProps = {
  messages: ChatMessage[]
  isStreaming: boolean
}

export const AssistantMessages = ({ messages, isStreaming }: AssistantMessagesProps) => {
  const endRef = useRef<HTMLDivElement>(null)

  // Follow the answer as it streams in, the way a chat is expected to behave.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4" aria-live="polite">
      <div className="flex gap-2 rounded-xl bg-accent p-4">
        <Sparkles className="size-4 flex-none text-primary" />
        <p className="text-[13px] leading-relaxed text-accent-foreground">
          <FormattedMessage id="assistant.greeting" />
        </p>
      </div>

      {messages.map((message) => {
        const isUser = message.role === AssistantRole.User

        return (
          <div
            key={message.id}
            className={cn(
              'max-w-[85%] rounded-xl px-4 py-2 text-[13px] leading-relaxed whitespace-pre-wrap',
              isUser
                ? 'self-end bg-primary text-primary-foreground'
                : 'self-start bg-muted text-foreground',
            )}
          >
            {message.content || (isStreaming && <span className="text-muted-foreground">…</span>)}
          </div>
        )
      })}

      <div ref={endRef} />
    </div>
  )
}
