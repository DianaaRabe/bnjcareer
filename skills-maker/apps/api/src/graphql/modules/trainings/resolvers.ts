import { Role } from '@prisma/client'
import type { CoachTrainingResolvers, MutationResolvers, QueryResolvers, TrainingResolvers } from '@gql/resolvers-types.js'
import { requireRole, requireUser } from '@/lib/rbac.js'
import {
  addTrainingModule,
  createTraining,
  deleteTraining,
  getMyTraining,
  listMyTrainings,
  removeTrainingModule,
  updateTraining,
  updateTrainingModule,
} from './trainingsCoachService.js'
import { getTraining, listCurriculum, listTrainings } from './trainingsService.js'

const trainings: QueryResolvers['trainings'] = async (_parent, _args, ctx) => {
  requireUser(ctx)
  return listTrainings(ctx)
}

const training: QueryResolvers['training'] = async (_parent, args, ctx) => {
  requireUser(ctx)
  return getTraining(ctx, args.id)
}

const myTrainings: QueryResolvers['myTrainings'] = async (_parent, _args, ctx) => {
  const user = requireRole(ctx, Role.COACH, Role.ADMIN)
  return listMyTrainings(ctx, user.id)
}

const myTraining: QueryResolvers['myTraining'] = async (_parent, args, ctx) => {
  const user = requireRole(ctx, Role.COACH, Role.ADMIN)
  return getMyTraining(ctx, user.id, args.id)
}

// The catalog query skips the programme — load it only when a caller asks for it there.
const curriculum: TrainingResolvers['curriculum'] = async (parent, _args, ctx) =>
  parent.curriculum ?? listCurriculum(ctx, parent.id)

const coachTrainingCurriculum: CoachTrainingResolvers['curriculum'] = async (parent, _args, ctx) =>
  parent.curriculum ?? listCurriculum(ctx, parent.id)

const createTrainingMutation: MutationResolvers['createTraining'] = async (_parent, args, ctx) => {
  const user = requireRole(ctx, Role.COACH, Role.ADMIN)
  return createTraining(ctx, user.id, args.input)
}

const updateTrainingMutation: MutationResolvers['updateTraining'] = async (_parent, args, ctx) => {
  const user = requireRole(ctx, Role.COACH, Role.ADMIN)
  return updateTraining(ctx, user.id, args.id, args.input)
}

const deleteTrainingMutation: MutationResolvers['deleteTraining'] = async (_parent, args, ctx) => {
  const user = requireRole(ctx, Role.COACH, Role.ADMIN)
  return deleteTraining(ctx, user.id, args.id)
}

const addTrainingModuleMutation: MutationResolvers['addTrainingModule'] = async (_parent, args, ctx) => {
  const user = requireRole(ctx, Role.COACH, Role.ADMIN)
  return addTrainingModule(ctx, user.id, args.trainingId, args.input)
}

const updateTrainingModuleMutation: MutationResolvers['updateTrainingModule'] = async (_parent, args, ctx) => {
  const user = requireRole(ctx, Role.COACH, Role.ADMIN)
  return updateTrainingModule(ctx, user.id, args.id, args.input)
}

const removeTrainingModuleMutation: MutationResolvers['removeTrainingModule'] = async (_parent, args, ctx) => {
  const user = requireRole(ctx, Role.COACH, Role.ADMIN)
  return removeTrainingModule(ctx, user.id, args.id)
}

export const trainingsResolvers = {
  Query: { trainings, training, myTrainings, myTraining },
  Mutation: {
    createTraining: createTrainingMutation,
    updateTraining: updateTrainingMutation,
    deleteTraining: deleteTrainingMutation,
    addTrainingModule: addTrainingModuleMutation,
    updateTrainingModule: updateTrainingModuleMutation,
    removeTrainingModule: removeTrainingModuleMutation,
  },
  Training: { curriculum },
  CoachTraining: { curriculum: coachTrainingCurriculum },
}
