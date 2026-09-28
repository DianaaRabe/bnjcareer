import type { CoachAgreement } from '@prisma/client'

export type GraphQLCoachAgreement = {
  id: string
  contractVersion: string
  signedName: string
  subscriptionShareCoachPct: number
  formationSharePlatformPct: number
  acceptedAt: string
}

/** Withholds the audit columns — IP and user agent are for the platform, not the coach. */
export function toGraphQLCoachAgreement(agreement: CoachAgreement): GraphQLCoachAgreement {
  return {
    id: agreement.id,
    contractVersion: agreement.contractVersion,
    signedName: agreement.signedName,
    subscriptionShareCoachPct: agreement.subscriptionShareCoachPct,
    formationSharePlatformPct: agreement.formationSharePlatformPct,
    acceptedAt: agreement.acceptedAt.toISOString(),
  }
}
