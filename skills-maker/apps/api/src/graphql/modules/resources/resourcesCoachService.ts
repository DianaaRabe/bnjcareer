import { ResourceAccess, ResourceCategory, ResourceType } from '@prisma/client'
import { GraphQLError } from 'graphql'
import { z } from 'zod'
import type { Context } from '@/context.js'
import { messages } from '@/constants/messages.js'
import { toGraphQLCoachResource, type GraphQLCoachResource } from './resourcesMappers.js'

/** Shared library — any coach manages the whole pool, there is no per-coach ownership. */
export async function listCoachResources(ctx: Context): Promise<GraphQLCoachResource[]> {
  const resources = await ctx.prisma.resource.findMany({ orderBy: { createdAt: 'desc' } })
  return resources.map(toGraphQLCoachResource)
}

export async function getCoachResource(ctx: Context, id: string): Promise<GraphQLCoachResource> {
  const resource = await ctx.prisma.resource.findUnique({ where: { id } })
  if (!resource) {
    throw new GraphQLError(messages.resourceNotFound, { extensions: { code: 'RESOURCE_NOT_FOUND' } })
  }
  return toGraphQLCoachResource(resource)
}

const createResourceSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).nullish(),
  type: z.nativeEnum(ResourceType),
  category: z.nativeEnum(ResourceCategory),
  url: z.string().trim().min(1).nullish(),
  sizeBytes: z.number().int().positive().nullish(),
  durationMinutes: z.number().int().positive().nullish(),
  access: z.nativeEnum(ResourceAccess).nullish(),
  priceCents: z.number().int().nonnegative().nullish(),
  published: z.boolean().nullish(),
})

export async function createResource(ctx: Context, input: unknown): Promise<GraphQLCoachResource> {
  const parsed = createResourceSchema.safeParse(input)
  if (!parsed.success) {
    throw new GraphQLError(messages.resourceInvalid, { extensions: { code: 'RESOURCE_INVALID' } })
  }

  const resource = await ctx.prisma.resource.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      type: parsed.data.type,
      category: parsed.data.category,
      url: parsed.data.url ?? null,
      sizeBytes: parsed.data.sizeBytes ?? null,
      durationMinutes: parsed.data.durationMinutes ?? null,
      access: parsed.data.access ?? ResourceAccess.FREE,
      priceCents: parsed.data.priceCents ?? null,
      // Omitted: falls back to the model's own default (published).
      ...(parsed.data.published != null ? { published: parsed.data.published } : {}),
    },
  })

  return toGraphQLCoachResource(resource)
}

const updateResourceSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).nullish(),
  type: z.nativeEnum(ResourceType).optional(),
  category: z.nativeEnum(ResourceCategory).optional(),
  url: z.string().trim().min(1).nullish(),
  sizeBytes: z.number().int().positive().nullish(),
  durationMinutes: z.number().int().positive().nullish(),
  access: z.nativeEnum(ResourceAccess).optional(),
  priceCents: z.number().int().nonnegative().nullish(),
  published: z.boolean().optional(),
})

async function requireResource(ctx: Context, id: string) {
  const resource = await ctx.prisma.resource.findUnique({ where: { id } })
  if (!resource) {
    throw new GraphQLError(messages.resourceNotFound, { extensions: { code: 'RESOURCE_NOT_FOUND' } })
  }
  return resource
}

export async function updateResource(ctx: Context, id: string, input: unknown): Promise<GraphQLCoachResource> {
  await requireResource(ctx, id)

  const parsed = updateResourceSchema.safeParse(input)
  if (!parsed.success) {
    throw new GraphQLError(messages.resourceInvalid, { extensions: { code: 'RESOURCE_INVALID' } })
  }

  const resource = await ctx.prisma.resource.update({ where: { id }, data: parsed.data })
  return toGraphQLCoachResource(resource)
}

export async function deleteResource(ctx: Context, id: string): Promise<boolean> {
  await requireResource(ctx, id)

  // No other model references a resource — a real delete is safe, unlike Training/CalendarEvent.
  await ctx.prisma.resource.delete({ where: { id } })
  return true
}
