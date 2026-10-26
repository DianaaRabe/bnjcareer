import { Role } from '@prisma/client'
import type { MutationResolvers, QueryResolvers } from '@gql/resolvers-types.js'
import { requireRole } from '@/lib/rbac.js'
import { getCoachAgreementStatus, signCoachAgreement } from './coachAgreementService.js'

const myCoachAgreement: QueryResolvers['myCoachAgreement'] = async (_parent, _args, ctx) => {
  const user = requireRole(ctx, Role.COACH, Role.ADMIN)
  return getCoachAgreementStatus(ctx, user.id)
}

const signCoachAgreementMutation: MutationResolvers['signCoachAgreement'] = async (
  _parent,
  args,
  ctx,
) => {
  const user = requireRole(ctx, Role.COACH, Role.ADMIN)
  return signCoachAgreement(ctx, user.id, args.input, ctx.audit)
}

export const coachAgreementResolvers = {
  Query: { myCoachAgreement },
  Mutation: { signCoachAgreement: signCoachAgreementMutation },
}
