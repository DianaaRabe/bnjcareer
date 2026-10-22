import type { QueryResolvers } from '@gql/resolvers-types.js'
import { requireUser } from '@/lib/rbac.js'
import { getCoachingOverview } from './coachingService.js'

const myCoaching: QueryResolvers['myCoaching'] = async (_parent, _args, ctx) => {
  const user = requireUser(ctx)
  return getCoachingOverview(ctx, user.id)
}

export const coachingResolvers = {
  Query: { myCoaching },
}
