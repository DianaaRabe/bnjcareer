import { CoachExpertise } from '@prisma/client'
import { GraphQLError } from 'graphql'
import { z } from 'zod'
import type { Context } from '@/context.js'
import { messages } from '@/constants/messages.js'
import { toGraphQLMyCoachProfile, type GraphQLMyCoachProfile } from './coachesMappers.js'

export async function getMyCoachProfile(ctx: Context, userId: string): Promise<GraphQLMyCoachProfile> {
  const profile = await ctx.prisma.coachProfile.findUnique({ where: { userId } })
  return toGraphQLMyCoachProfile(profile)
}

const updateCoachProfileSchema = z.object({
  specialty: z.string().trim().min(1).nullish(),
  yearsExperience: z.number().int().nonnegative().nullish(),
  certifications: z.array(z.string().trim().min(1)).optional(),
  expertise: z.array(z.nativeEnum(CoachExpertise)).optional(),
  acceptingClients: z.boolean().optional(),
  published: z.boolean().optional(),
})

export async function updateCoachProfile(
  ctx: Context,
  userId: string,
  input: unknown,
): Promise<GraphQLMyCoachProfile> {
  const parsed = updateCoachProfileSchema.safeParse(input)
  if (!parsed.success) {
    throw new GraphQLError(messages.coachProfileInvalid, { extensions: { code: 'COACH_PROFILE_INVALID' } })
  }

  // No row until the coach's first save — upsert provisions it instead of requiring a separate step.
  const profile = await ctx.prisma.coachProfile.upsert({
    where: { userId },
    create: { userId, ...parsed.data },
    update: parsed.data,
  })

  return toGraphQLMyCoachProfile(profile)
}
