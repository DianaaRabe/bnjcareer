import { GraphQLError } from 'graphql'
import { z } from 'zod'
import { messages } from '@/constants/messages.js'

/** Kept small on purpose: the whole history is re-sent on every question. */
export const MAX_MESSAGES = 30

/** Beyond this, a single message is abuse rather than a conversation — rejected outright. */
export const MAX_MESSAGE_LENGTH = 16000

/**
 * Older turns are trimmed to this before reaching the model. A long past answer must not
 * cost the candidate their conversation: the cap bounds the payload, it does not gate it.
 */
export const CONTEXT_MESSAGE_LENGTH = 4000

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['USER', 'ASSISTANT']),
        content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
      }),
    )
    .min(1)
    .max(MAX_MESSAGES),
})

export type AssistantAsk = z.infer<typeof schema>

const invalid = () =>
  new GraphQLError(messages.assistantInputInvalid, {
    extensions: { code: 'ASSISTANT_INPUT_INVALID' },
  })

export function parseAssistantAsk(input: unknown): AssistantAsk {
  const parsed = schema.safeParse(input)

  if (!parsed.success) {
    throw invalid()
  }

  // A conversation must end on the candidate's turn, otherwise there is nothing to answer.
  const last = parsed.data.messages[parsed.data.messages.length - 1]
  if (last.role !== 'USER') {
    throw invalid()
  }

  return {
    messages: parsed.data.messages.map((message, index) =>
      // The new question goes through whole; only past turns are trimmed.
      index === parsed.data.messages.length - 1
        ? message
        : { ...message, content: message.content.slice(0, CONTEXT_MESSAGE_LENGTH) },
    ),
  }
}
