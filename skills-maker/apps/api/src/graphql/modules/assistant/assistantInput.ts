import { GraphQLError } from 'graphql'
import { z } from 'zod'
import { messages } from '@/constants/messages.js'

/** Kept small on purpose: the whole history is re-sent on every question. */
export const MAX_MESSAGES = 30
export const MAX_MESSAGE_LENGTH = 4000

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

export function parseAssistantAsk(input: unknown): AssistantAsk {
  const parsed = schema.safeParse(input)

  if (!parsed.success) {
    throw new GraphQLError(messages.assistantInputInvalid, {
      extensions: { code: 'ASSISTANT_INPUT_INVALID' },
    })
  }

  // A conversation must end on the candidate's turn, otherwise there is nothing to answer.
  const last = parsed.data.messages[parsed.data.messages.length - 1]
  if (last.role !== 'USER') {
    throw new GraphQLError(messages.assistantInputInvalid, {
      extensions: { code: 'ASSISTANT_INPUT_INVALID' },
    })
  }

  return parsed.data
}
