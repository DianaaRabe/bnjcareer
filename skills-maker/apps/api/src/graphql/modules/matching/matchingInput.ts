import { GraphQLError } from 'graphql'
import { z } from 'zod'
import { messages } from '@/constants/messages.js'
import { MAX_DESCRIPTION_LENGTH, MIN_DESCRIPTION_LENGTH } from './matchingConstants.js'

const analyzeJobMatchSchema = z.object({
  jobUrl: z.string().trim().max(2000).nullish(),
  jobTitle: z.string().trim().max(300).nullish(),
  company: z.string().trim().max(300).nullish(),
  description: z.string().trim().min(MIN_DESCRIPTION_LENGTH).max(MAX_DESCRIPTION_LENGTH),
})

export type AnalyzeJobMatchInput = z.infer<typeof analyzeJobMatchSchema>

/**
 * Validates the mutation input. "Paste more text" and "this input is invalid" are different
 * problems for the candidate, so they get different codes — the client maps each to its own message.
 */
export function parseAnalyzeJobMatchInput(input: unknown): AnalyzeJobMatchInput {
  const parsed = analyzeJobMatchSchema.safeParse(input)
  if (parsed.success) {
    return parsed.data
  }

  const isDescriptionTooShort = parsed.error.issues.some(
    (issue) => issue.path[0] === 'description' && issue.code === 'too_small',
  )

  throw isDescriptionTooShort
    ? new GraphQLError(messages.matchingDescriptionTooShort, {
        extensions: { code: 'MATCHING_DESCRIPTION_TOO_SHORT' },
      })
    : new GraphQLError(messages.matchingInputInvalid, { extensions: { code: 'BAD_USER_INPUT' } })
}
