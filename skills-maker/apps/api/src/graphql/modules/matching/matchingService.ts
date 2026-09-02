import { GraphQLError } from 'graphql'
import type { Context } from '@/context.js'
import { messages } from '@/constants/messages.js'
import { callLLM, LLMError } from '@/lib/llmClient.js'
import { getMyCv } from '../cv/cvService.js'
import { parseAnalyzeJobMatchInput } from './matchingInput.js'
import { parseJobMatchResult, type JobMatchResult } from './matchingLlmParsing.js'
import { buildJobMatchMessages } from './matchingPrompts.js'

export async function analyzeJobMatch(ctx: Context, input: unknown): Promise<JobMatchResult> {
  const offer = parseAnalyzeJobMatchInput(input)

  const cv = await getMyCv(ctx)
  if (!cv?.extractedData) {
    throw new GraphQLError(messages.matchingRequiresCv, {
      extensions: { code: 'MATCHING_REQUIRES_CV' },
    })
  }

  try {
    const { content } = await callLLM({
      messages: buildJobMatchMessages(cv.extractedData, offer),
      temperature: 0.2,
      maxTokens: 1500,
      jsonMode: true,
    })

    return parseJobMatchResult(content)
  } catch (err) {
    const detail = err instanceof LLMError ? err.attempts.map((a) => a.error).join('; ') : String(err)
    console.error('[matchingService] analysis failed:', detail)
    throw new GraphQLError(messages.matchingFailed, { extensions: { code: 'MATCHING_FAILED' } })
  }
}
