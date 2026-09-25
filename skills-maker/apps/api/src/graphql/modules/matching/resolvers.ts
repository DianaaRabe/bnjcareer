import type { MutationResolvers } from '@gql/resolvers-types.js'
import { requireUser } from '@/lib/rbac.js'
import { analyzeJobMatch } from './matchingService.js'

const analyzeJobMatchMutation: MutationResolvers['analyzeJobMatch'] = async (_parent, args, ctx) => {
  requireUser(ctx)
  return analyzeJobMatch(ctx, args.input)
}

export const matchingResolvers = {
  Mutation: { analyzeJobMatch: analyzeJobMatchMutation },
}
