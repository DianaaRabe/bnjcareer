import type { QueryResolvers } from '@gql/resolvers-types.js'
import { requireUser } from '@/lib/rbac.js'
import { listCoaches } from './coachesService.js'

const coaches: QueryResolvers['coaches'] = async (_parent, _args, ctx) => {
  requireUser(ctx)
  return listCoaches(ctx)
}

export const coachesResolvers = {
  Query: { coaches },
}
