import { GraphQLError } from 'graphql'
import type { Context } from '@/context.js'
import { messages as appMessages } from '@/constants/messages.js'
import { streamLLM, type LLMMessage } from '@/lib/llmClient.js'
import { parseAssistantAsk } from './assistantInput.js'
import { buildSystemPrompt } from './assistantPrompts.js'

export type AssistantChunk = { delta: string; done: boolean }

const TEMPERATURE = 0.7
const MAX_TOKENS = 2000

export async function* streamAssistantReply(
  ctx: Context,
  userId: string,
  input: unknown,
): AsyncGenerator<AssistantChunk> {
  const ask = parseAssistantAsk(input)
  const profile = await ctx.prisma.profile.findUnique({ where: { userId } })

  const llmMessages: LLMMessage[] = [
    { role: 'system', content: buildSystemPrompt(profile) },
    ...ask.messages.map(({ role, content }) => ({
      role: role === 'USER' ? ('user' as const) : ('assistant' as const),
      content,
    })),
  ]

  try {
    for await (const delta of streamLLM({
      messages: llmMessages,
      temperature: TEMPERATURE,
      maxTokens: MAX_TOKENS,
    })) {
      yield { delta, done: false }
    }
  } catch {
    // The provider details are noise for the candidate — surface one actionable message.
    throw new GraphQLError(appMessages.assistantFailed, {
      extensions: { code: 'ASSISTANT_FAILED' },
    })
  }

  // A final empty chunk tells the client the answer is complete.
  yield { delta: '', done: true }
}
