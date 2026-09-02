import type { QueryResolvers } from '@gql/resolvers-types.js'
import { requireUser } from '@/lib/rbac.js'
import { listResources } from './resourcesService.js'

const resources: QueryResolvers['resources'] = async (_parent, _args, ctx) => {
  requireUser(ctx)
  return listResources(ctx)
}

export const resourcesResolvers = {
  Query: { resources },
}
