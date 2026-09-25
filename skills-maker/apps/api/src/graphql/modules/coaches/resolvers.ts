import { Role } from '@prisma/client'
import type { MutationResolvers, QueryResolvers } from '@gql/resolvers-types.js'
import { requireRole, requireUser } from '@/lib/rbac.js'
import { getMyCoachProfile, updateCoachProfile } from './coachesProfileService.js'
import { listCoaches } from './coachesService.js'

const coaches: QueryResolvers['coaches'] = async (_parent, _args, ctx) => {
  requireUser(ctx)
  return listCoaches(ctx)
}

const myCoachProfile: QueryResolvers['myCoachProfile'] = async (_parent, _args, ctx) => {
  const user = requireRole(ctx, Role.COACH, Role.ADMIN)
  return getMyCoachProfile(ctx, user.id)
}

const updateCoachProfileMutation: MutationResolvers['updateCoachProfile'] = async (_parent, args, ctx) => {
  const user = requireRole(ctx, Role.COACH, Role.ADMIN)
  return updateCoachProfile(ctx, user.id, args.input)
}

export const coachesResolvers = {
  Query: { coaches, myCoachProfile },
  Mutation: { updateCoachProfile: updateCoachProfileMutation },
}
