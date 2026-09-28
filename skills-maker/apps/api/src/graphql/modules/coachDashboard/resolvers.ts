import { Role } from '@prisma/client'
import type { QueryResolvers } from '@gql/resolvers-types.js'
import { requireRole } from '@/lib/rbac.js'
import { getCoachCandidate, getCoachDashboard, listMyCandidates } from './coachDashboardService.js'

const myCandidates: QueryResolvers['myCandidates'] = async (_parent, _args, ctx) => {
  const user = requireRole(ctx, Role.COACH, Role.ADMIN)
  return listMyCandidates(ctx, user.id)
}

const coachDashboard: QueryResolvers['coachDashboard'] = async (_parent, _args, ctx) => {
  const user = requireRole(ctx, Role.COACH, Role.ADMIN)
  return getCoachDashboard(ctx, user.id)
}

const coachCandidate: QueryResolvers['coachCandidate'] = async (_parent, args, ctx) => {
  const user = requireRole(ctx, Role.COACH, Role.ADMIN)
  return getCoachCandidate(ctx, user.id, args.id)
}

export const coachDashboardResolvers = {
  Query: { myCandidates, coachDashboard, coachCandidate },
}
