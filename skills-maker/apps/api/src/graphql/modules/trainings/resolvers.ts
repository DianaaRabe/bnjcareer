import type { QueryResolvers, TrainingResolvers } from '@gql/resolvers-types.js'
import { requireUser } from '@/lib/rbac.js'
import { getTraining, listTrainings, listCurriculum } from './trainingsService.js'

const trainings: QueryResolvers['trainings'] = async (_parent, _args, ctx) => {
  requireUser(ctx)
  return listTrainings(ctx)
}

const training: QueryResolvers['training'] = async (_parent, args, ctx) => {
  requireUser(ctx)
  return getTraining(ctx, args.id)
}

// The catalog query skips the programme — load it only when a caller asks for it there.
const curriculum: TrainingResolvers['curriculum'] = async (parent, _args, ctx) =>
  parent.curriculum ?? listCurriculum(ctx, parent.id)

export const trainingsResolvers = {
  Query: { trainings, training },
  Training: { curriculum },
}
