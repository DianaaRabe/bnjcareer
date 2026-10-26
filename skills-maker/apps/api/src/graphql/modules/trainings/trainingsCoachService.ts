import { TrainingCategory, TrainingLevel } from '@prisma/client'
import { GraphQLError } from 'graphql'
import { z } from 'zod'
import type { Context } from '@/context.js'
import { messages } from '@/constants/messages.js'
import {
  toGraphQLCoachTraining,
  toGraphQLCoachTrainingDetail,
  toGraphQLTrainingModule,
  type GraphQLCoachTraining,
  type GraphQLTrainingModule,
} from './trainingsMappers.js'

const withModuleCount = { _count: { select: { curriculum: true } } }

export async function listMyTrainings(ctx: Context, coachId: string): Promise<GraphQLCoachTraining[]> {
  const trainings = await ctx.prisma.training.findMany({
    where: { coachId, removed: false },
    orderBy: { createdAt: 'desc' },
    include: withModuleCount,
  })

  return trainings.map(toGraphQLCoachTraining)
}

export async function getMyTraining(ctx: Context, coachId: string, id: string): Promise<GraphQLCoachTraining> {
  const training = await ctx.prisma.training.findFirst({
    where: { id, coachId, removed: false },
    include: { ...withModuleCount, curriculum: { orderBy: { position: 'asc' } } },
  })

  // A training that exists but belongs to someone else (or was removed) is reported as missing, never as forbidden.
  if (!training) {
    throw new GraphQLError(messages.trainingNotFound, { extensions: { code: 'TRAINING_NOT_FOUND' } })
  }

  return toGraphQLCoachTrainingDetail(training)
}

const createTrainingSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).nullish(),
  category: z.nativeEnum(TrainingCategory),
  level: z.nativeEnum(TrainingLevel),
  priceCents: z.number().int().nonnegative().nullish(),
  durationDays: z.number().int().positive(),
  instructor: z.string().trim().min(1).nullish(),
  certificate: z.boolean().nullish(),
})

export async function createTraining(ctx: Context, coachId: string, input: unknown): Promise<GraphQLCoachTraining> {
  const parsed = createTrainingSchema.safeParse(input)
  if (!parsed.success) {
    throw new GraphQLError(messages.trainingInvalid, { extensions: { code: 'TRAINING_INVALID' } })
  }

  const training = await ctx.prisma.training.create({
    data: {
      coachId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      category: parsed.data.category,
      level: parsed.data.level,
      priceCents: parsed.data.priceCents ?? null,
      durationDays: parsed.data.durationDays,
      instructor: parsed.data.instructor ?? null,
      certificate: parsed.data.certificate ?? false,
      // Every training starts as a draft — the coach publishes once the curriculum is ready.
      published: false,
    },
    include: withModuleCount,
  })

  return toGraphQLCoachTraining(training)
}

const updateTrainingSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).nullish(),
  category: z.nativeEnum(TrainingCategory).optional(),
  level: z.nativeEnum(TrainingLevel).optional(),
  priceCents: z.number().int().nonnegative().nullish(),
  durationDays: z.number().int().positive().optional(),
  instructor: z.string().trim().min(1).nullish(),
  certificate: z.boolean().optional(),
  published: z.boolean().optional(),
})

export async function updateTraining(
  ctx: Context,
  coachId: string,
  id: string,
  input: unknown,
): Promise<GraphQLCoachTraining> {
  const existing = await ctx.prisma.training.findFirst({ where: { id, coachId, removed: false } })
  if (!existing) {
    throw new GraphQLError(messages.trainingNotFound, { extensions: { code: 'TRAINING_NOT_FOUND' } })
  }

  const parsed = updateTrainingSchema.safeParse(input)
  if (!parsed.success) {
    throw new GraphQLError(messages.trainingInvalid, { extensions: { code: 'TRAINING_INVALID' } })
  }

  const training = await ctx.prisma.training.update({
    where: { id },
    data: parsed.data,
    include: withModuleCount,
  })

  return toGraphQLCoachTraining(training)
}

export async function deleteTraining(ctx: Context, coachId: string, id: string): Promise<boolean> {
  const existing = await ctx.prisma.training.findFirst({ where: { id, coachId, removed: false } })
  if (!existing) {
    throw new GraphQLError(messages.trainingNotFound, { extensions: { code: 'TRAINING_NOT_FOUND' } })
  }

  // Soft delete — the row stays for audit / in-flight enrollments, every read filters it out.
  await ctx.prisma.training.update({ where: { id }, data: { removed: true } })
  return true
}

const moduleSchema = z.object({
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1).nullish(),
  durationMinutes: z.number().int().positive().nullish(),
})

async function requireOwnedTraining(ctx: Context, coachId: string, trainingId: string) {
  const training = await ctx.prisma.training.findFirst({ where: { id: trainingId, coachId, removed: false } })
  if (!training) {
    throw new GraphQLError(messages.trainingNotFound, { extensions: { code: 'TRAINING_NOT_FOUND' } })
  }
  return training
}

async function requireOwnedModule(ctx: Context, coachId: string, moduleId: string) {
  const trainingModule = await ctx.prisma.trainingModule.findFirst({
    where: { id: moduleId, training: { coachId, removed: false } },
  })
  if (!trainingModule) {
    throw new GraphQLError(messages.trainingModuleNotFound, { extensions: { code: 'TRAINING_MODULE_NOT_FOUND' } })
  }
  return trainingModule
}

export async function addTrainingModule(
  ctx: Context,
  coachId: string,
  trainingId: string,
  input: unknown,
): Promise<GraphQLTrainingModule> {
  await requireOwnedTraining(ctx, coachId, trainingId)

  const parsed = moduleSchema.safeParse(input)
  if (!parsed.success) {
    throw new GraphQLError(messages.trainingModuleInvalid, { extensions: { code: 'TRAINING_MODULE_INVALID' } })
  }

  // Appended at the end — reordering existing modules isn't supported yet.
  const count = await ctx.prisma.trainingModule.count({ where: { trainingId } })

  const trainingModule = await ctx.prisma.trainingModule.create({
    data: {
      trainingId,
      position: count + 1,
      title: parsed.data.title,
      summary: parsed.data.summary ?? null,
      durationMinutes: parsed.data.durationMinutes ?? null,
    },
  })

  return toGraphQLTrainingModule(trainingModule)
}

export async function updateTrainingModule(
  ctx: Context,
  coachId: string,
  id: string,
  input: unknown,
): Promise<GraphQLTrainingModule> {
  await requireOwnedModule(ctx, coachId, id)

  const parsed = moduleSchema.safeParse(input)
  if (!parsed.success) {
    throw new GraphQLError(messages.trainingModuleInvalid, { extensions: { code: 'TRAINING_MODULE_INVALID' } })
  }

  const trainingModule = await ctx.prisma.trainingModule.update({
    where: { id },
    data: {
      title: parsed.data.title,
      summary: parsed.data.summary ?? null,
      durationMinutes: parsed.data.durationMinutes ?? null,
    },
  })

  return toGraphQLTrainingModule(trainingModule)
}

export async function removeTrainingModule(ctx: Context, coachId: string, id: string): Promise<boolean> {
  const owned = await requireOwnedModule(ctx, coachId, id)

  // Positions must stay contiguous — addTrainingModule relies on count() to place the next one.
  const following = await ctx.prisma.trainingModule.findMany({
    where: { trainingId: owned.trainingId, position: { gt: owned.position } },
    orderBy: { position: 'asc' },
  })

  await ctx.prisma.$transaction([
    ctx.prisma.trainingModule.delete({ where: { id } }),
    ...following.map((module) =>
      ctx.prisma.trainingModule.update({ where: { id: module.id }, data: { position: module.position - 1 } }),
    ),
  ])

  return true
}
