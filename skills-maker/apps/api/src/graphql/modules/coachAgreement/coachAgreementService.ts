import { GraphQLError } from 'graphql'
import { z } from 'zod'
import type { Context } from '@/context.js'
import { messages } from '@/constants/messages.js'
import {
  CURRENT_CONTRACT_VERSION,
  FORMATION_SHARE_PLATFORM_PCT,
  MAX_SIGNED_NAME_LENGTH,
  MIN_SIGNED_NAME_LENGTH,
  SUBSCRIPTION_SHARE_COACH_PCT,
} from './coachAgreementConstants.js'
import { toGraphQLCoachAgreement, type GraphQLCoachAgreement } from './coachAgreementMappers.js'

export const TERMS = {
  currentVersion: CURRENT_CONTRACT_VERSION,
  subscriptionShareCoachPct: SUBSCRIPTION_SHARE_COACH_PCT,
  formationSharePlatformPct: FORMATION_SHARE_PLATFORM_PCT,
}

const signSchema = z.object({
  contractVersion: z.string().trim().min(1),
  signedName: z.string().trim().min(MIN_SIGNED_NAME_LENGTH).max(MAX_SIGNED_NAME_LENGTH),
})

/** Signature audit metadata, captured from the request rather than trusted from the client. */
export type SignatureContext = { ipAddress?: string | null; userAgent?: string | null }

const findSignature = (ctx: Context, coachId: string) =>
  ctx.prisma.coachAgreement.findFirst({
    where: { coachId, contractVersion: CURRENT_CONTRACT_VERSION, revokedAt: null },
    orderBy: { acceptedAt: 'desc' },
  })

export async function getCoachAgreementStatus(ctx: Context, coachId: string) {
  const signature = await findSignature(ctx, coachId)

  return {
    terms: TERMS,
    isSigned: signature !== null,
    signature: signature ? toGraphQLCoachAgreement(signature) : null,
  }
}

export async function signCoachAgreement(
  ctx: Context,
  coachId: string,
  input: unknown,
  audit: SignatureContext,
): Promise<GraphQLCoachAgreement> {
  const parsed = signSchema.safeParse(input)
  if (!parsed.success) {
    throw new GraphQLError(messages.coachAgreementInvalid, {
      extensions: { code: 'COACH_AGREEMENT_INVALID' },
    })
  }

  // Signing an outdated version would record consent to terms no longer in force.
  if (parsed.data.contractVersion !== CURRENT_CONTRACT_VERSION) {
    throw new GraphQLError(messages.coachAgreementOutdated, {
      extensions: { code: 'COACH_AGREEMENT_OUTDATED' },
    })
  }

  // Idempotent: a coach clicking twice keeps their first signature and its timestamp.
  const existing = await findSignature(ctx, coachId)
  if (existing) {
    return toGraphQLCoachAgreement(existing)
  }

  const agreement = await ctx.prisma.coachAgreement.create({
    data: {
      coachId,
      contractVersion: CURRENT_CONTRACT_VERSION,
      signedName: parsed.data.signedName,
      // Frozen from the constants, never from the client: the coach cannot pick their split.
      subscriptionShareCoachPct: SUBSCRIPTION_SHARE_COACH_PCT,
      formationSharePlatformPct: FORMATION_SHARE_PLATFORM_PCT,
      ipAddress: audit.ipAddress ?? null,
      userAgent: audit.userAgent ?? null,
    },
  })

  return toGraphQLCoachAgreement(agreement)
}
