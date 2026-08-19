import { GraphQLError } from 'graphql'
import type { Context } from '@/context.js'
import { messages } from '@/constants/messages.js'
import {
  toGraphQLTraining,
  toGraphQLTrainingDetail,
  toGraphQLTrainingModule,
  type GraphQLTraining,
} from './trainingsMappers.js'

const withModuleCount = { _count: { select: { curriculum: true } } }

export async function listTrainings(ctx: Context): Promise<GraphQLTraining[]> {
  const trainings = await ctx.prisma.training.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: withModuleCount,
  })

  return trainings.map(toGraphQLTraining)
}

export async function getTraining(ctx: Context, id: string): Promise<GraphQLTraining> {
  const training = await ctx.prisma.training.findFirst({
    where: { id, published: true },
    include: { ...withModuleCount, curriculum: { orderBy: { position: 'asc' } } },
  })

  // Unpublished drafts are reported as missing — their existence is not the candidate's business.
  if (!training) {
    throw new GraphQLError(messages.trainingNotFound, { extensions: { code: 'TRAINING_NOT_FOUND' } })
  }

  return toGraphQLTrainingDetail(training)
}

export async function listCurriculum(ctx: Context, trainingId: string) {
  const modules = await ctx.prisma.trainingModule.findMany({
    where: { trainingId },
    orderBy: { position: 'asc' },
  })

  return modules.map(toGraphQLTrainingModule)
}
