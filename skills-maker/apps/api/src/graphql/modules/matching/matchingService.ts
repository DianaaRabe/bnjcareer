import { GraphQLError } from 'graphql'
import type { Context } from '@/context.js'
import { messages } from '@/constants/messages.js'
import { callLLM, LLMError } from '@/lib/llmClient.js'
import { recordApplication, recordMatchAnalysis } from '@/lib/candidateTracking.js'
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

    const result = parseJobMatchResult(content)

    // Persist so the candidate dashboard and coaching journey reflect this real action.
    // Best-effort: a write failure must never turn a successful analysis into an error.
    if (ctx.user) {
      try {
        const application = await recordApplication(
          ctx,
          {
            title: offer.jobTitle ?? offer.company ?? 'Offre analysée',
            company: offer.company,
            description: offer.description,
            source: 'MATCHING',
            url: offer.jobUrl,
          },
          { status: 'PENDING', matchScore: result.score },
        )
        await recordMatchAnalysis(ctx, application.id, {
          score: result.score,
          gaps: result.gaps,
          suggestions: result.tips,
        })
      } catch (persistErr) {
        console.error('[matchingService] tracking persist failed:', persistErr)
      }
    }

    return result
  } catch (err) {
    const detail = err instanceof LLMError ? err.attempts.map((a) => a.error).join('; ') : String(err)
    console.error('[matchingService] analysis failed:', detail)
    throw new GraphQLError(messages.matchingFailed, { extensions: { code: 'MATCHING_FAILED' } })
  }
}
