import { GraphQLError } from 'graphql'
import { z } from 'zod'
import { ProfileObjective, ProfileSituation } from '@prisma/client'
import type { Context } from '@/context.js'
import { messages } from '@/constants/messages.js'

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .transform((value) => new Date(value))

const chip = z.string().trim().min(1).max(60)

// `null` clears a field, `undefined`/omitted leaves it untouched — Prisma ignores undefined keys.
const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(80).nullable().optional(),
  lastName: z.string().trim().min(1).max(80).nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  bio: z.string().trim().max(2000).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  birthDate: isoDate.nullable().optional(),
  educationLevel: z.string().trim().min(1).max(80).nullable().optional(),
  school: z.string().trim().min(1).max(150).nullable().optional(),
  sector: z.string().trim().min(1).max(80).nullable().optional(),
  situation: z.nativeEnum(ProfileSituation).nullable().optional(),
  strengths: z.array(chip).max(3).optional(),
  improvements: z.array(chip).max(3).optional(),
  skills: z.array(chip).max(30).optional(),
  objective: z.nativeEnum(ProfileObjective).nullable().optional(),
})

export async function getProfileByUserId(ctx: Context, userId: string) {
  return ctx.prisma.profile.findUnique({ where: { userId } })
}

export async function updateProfile(ctx: Context, userId: string, input: unknown) {
  const parsed = updateProfileSchema.safeParse(input)
  if (!parsed.success) {
    throw new GraphQLError(messages.invalidProfileInput, { extensions: { code: 'BAD_USER_INPUT' } })
  }

  return ctx.prisma.profile.update({
    where: { userId },
    data: parsed.data,
  })
}
