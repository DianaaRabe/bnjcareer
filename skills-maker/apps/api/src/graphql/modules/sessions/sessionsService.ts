import { EventType } from '@prisma/client'
import { GraphQLError } from 'graphql'
import { z } from 'zod'
import type { Context } from '@/context.js'
import { messages } from '@/constants/messages.js'
import {
  toGraphQLCoachSession,
  toGraphQLCoachSessionDetail,
  type GraphQLCoachSession,
} from './sessionsMappers.js'

const withAttendeeCount = { _count: { select: { bookings: { where: { status: 'BOOKED' as const } } } } }
const withAttendees = { bookings: { include: { user: { include: { profile: true } } } } }

export async function listMySessions(ctx: Context, coachId: string): Promise<GraphQLCoachSession[]> {
  const sessions = await ctx.prisma.calendarEvent.findMany({
    where: { coachId },
    orderBy: { startTime: 'desc' },
    include: withAttendeeCount,
  })

  return sessions.map(toGraphQLCoachSession)
}

export async function getMySession(ctx: Context, coachId: string, id: string): Promise<GraphQLCoachSession> {
  const session = await ctx.prisma.calendarEvent.findFirst({
    where: { id, coachId },
    include: withAttendees,
  })

  // A session that exists but belongs to another coach is reported as missing, never as forbidden.
  if (!session) {
    throw new GraphQLError(messages.sessionNotFound, { extensions: { code: 'SESSION_NOT_FOUND' } })
  }

  return toGraphQLCoachSessionDetail(session)
}

const createSessionSchema = z
  .object({
    title: z.string().trim().min(1),
    type: z.nativeEnum(EventType),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
  })
  .refine((data) => data.endTime > data.startTime, { path: ['endTime'] })

export async function createSession(ctx: Context, coachId: string, input: unknown): Promise<GraphQLCoachSession> {
  const parsed = createSessionSchema.safeParse(input)
  if (!parsed.success) {
    throw new GraphQLError(messages.sessionInvalid, { extensions: { code: 'SESSION_INVALID' } })
  }

  const session = await ctx.prisma.calendarEvent.create({
    data: {
      coachId,
      title: parsed.data.title,
      type: parsed.data.type,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
    },
    include: withAttendeeCount,
  })

  return toGraphQLCoachSession(session)
}

const updateSessionSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    type: z.nativeEnum(EventType).optional(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
  })
  .refine((data) => !data.startTime || !data.endTime || data.endTime > data.startTime, { path: ['endTime'] })

async function requireOwnedSession(ctx: Context, coachId: string, id: string) {
  const session = await ctx.prisma.calendarEvent.findFirst({ where: { id, coachId } })
  if (!session) {
    throw new GraphQLError(messages.sessionNotFound, { extensions: { code: 'SESSION_NOT_FOUND' } })
  }
  return session
}

export async function updateSession(
  ctx: Context,
  coachId: string,
  id: string,
  input: unknown,
): Promise<GraphQLCoachSession> {
  const existing = await requireOwnedSession(ctx, coachId, id)

  const parsed = updateSessionSchema.safeParse(input)
  if (!parsed.success) {
    throw new GraphQLError(messages.sessionInvalid, { extensions: { code: 'SESSION_INVALID' } })
  }

  const session = await ctx.prisma.calendarEvent.update({
    where: { id: existing.id },
    data: parsed.data,
    include: withAttendeeCount,
  })

  return toGraphQLCoachSession(session)
}

export async function cancelSession(ctx: Context, coachId: string, id: string): Promise<boolean> {
  const existing = await requireOwnedSession(ctx, coachId, id)

  // Soft cancel — history (past attendance, dashboard counts) must stay intact.
  await ctx.prisma.calendarEvent.update({ where: { id: existing.id }, data: { status: 'CANCELED' } })
  return true
}

export async function cancelBooking(ctx: Context, coachId: string, id: string): Promise<boolean> {
  const booking = await ctx.prisma.booking.findFirst({ where: { id, event: { coachId } } })
  if (!booking) {
    throw new GraphQLError(messages.bookingNotFound, { extensions: { code: 'BOOKING_NOT_FOUND' } })
  }

  await ctx.prisma.booking.update({ where: { id: booking.id }, data: { status: 'CANCELED' } })
  return true
}
