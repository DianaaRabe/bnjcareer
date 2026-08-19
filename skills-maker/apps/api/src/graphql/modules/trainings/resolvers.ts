import type { QueryResolvers } from '@gql/resolvers-types.js'
import { requireUser } from '@/lib/rbac.js'
import { listTrainings } from './trainingsService.js'

const trainings: QueryResolvers['trainings'] = async (_parent, _args, ctx) => {
  requireUser(ctx)
  return listTrainings(ctx)
}

export const trainingsResolvers = {
  Query: { trainings },
}
