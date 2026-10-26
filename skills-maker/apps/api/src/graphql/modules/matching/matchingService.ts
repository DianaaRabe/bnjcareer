import { GraphQLError } from 'graphql'
import type { Context } from '@/context.js'
import { messages } from '@/constants/messages.js'
import { callLLM, LLMError } from '@/lib/llmClient.js'
import { recordApplication, recordMatchAnalysis } from '@/lib/candidateTracking.js'
import { getMyCv } from '../cv/cvService.js'
import { parseAnalyzeJobMatchInput } from './matchingInput.js'
import { parseJobMatchResult, type JobMatchResult } from './matchingLlmParsing.js'
import { buildJobMatchMessages, type JobOfferContext } from './matchingPrompts.js'
export type { JobOfferContext }

/**
 * Scores one offer against an already-extracted CV. Extracted from `analyzeJobMatch` so the
 * automation engine reuses the exact same prompt, model routing and parser instead of
 * re-implementing the matcher (skill §5: "reuse an existing matching engine").
 */
export async function scoreJobOffer(extractedData: unknown, offer: JobOfferContext): Promise<JobMatchResult> {
  const { content } = await callLLM({
    messages: buildJobMatchMessages(extractedData, offer),
    temperature: 0.2,
    maxTokens: 1500,
    jsonMode: true,
  })
  return parseJobMatchResult(content)
}

export async function analyzeJobMatch(
  ctx: Context,
  input: unknown,
): Promise<JobMatchResult & { score: number }> {
  const offer = parseAnalyzeJobMatchInput(input)

  const cv = await getMyCv(ctx)
  if (!cv?.extractedData) {
    throw new GraphQLError(messages.matchingRequiresCv, {
      extensions: { code: 'MATCHING_REQUIRES_CV' },
    })
  }

  try {
    const result = await scoreJobOffer(cv.extractedData, offer)

    // The interactive mutation exposes `score: Int!`: a result with no usable score is an LLM
    // failure for this path, not a 0% verdict. The engine, by contrast, keeps the null and routes
    // the job to review instead of raising.
    if (result.score === null) {
      throw new LLMError('matching returned no usable score', [])
    }
    const score = result.score

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
          { status: 'PENDING', matchScore: score },
        )
        await recordMatchAnalysis(ctx, application.id, {
          score,
          gaps: result.gaps,
          suggestions: result.tips,
        })
      } catch (persistErr) {
        console.error('[matchingService] tracking persist failed:', persistErr)
      }
    }

    return { ...result, score }
  } catch (err) {
    const detail = err instanceof LLMError ? err.attempts.map((a) => a.error).join('; ') : String(err)
    console.error('[matchingService] analysis failed:', detail)
    throw new GraphQLError(messages.matchingFailed, { extensions: { code: 'MATCHING_FAILED' } })
  }
}
