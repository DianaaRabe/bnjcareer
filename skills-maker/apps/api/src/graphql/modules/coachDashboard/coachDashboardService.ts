import { GraphQLError } from 'graphql'
import type { Context } from '@/context.js'
import { messages } from '@/constants/messages.js'
import {
  CANDIDATE_APPLICATIONS_LIMIT,
  RECENT_CANDIDATES_LIMIT,
  UPCOMING_SESSIONS_LIMIT,
} from './coachDashboardConstants.js'
import {
  toCoachCandidates,
  toCoachUpcomingSession,
  toGraphQLCoachCandidateDetail,
  type GraphQLCoachCandidate,
  type GraphQLCoachCandidateDetail,
  type GraphQLCoachUpcomingSession,
} from './coachDashboardMappers.js'

const DAY_MS = 24 * 60 * 60 * 1000

/** Monday 00:00 of the week containing `date`. */
function startOfWeek(date: Date): Date {
  const start = new Date(date)
  const day = start.getDay() // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diffToMonday)
  start.setHours(0, 0, 0, 0)
  return start
}

/** Candidates who booked at least one session with this coach — the only coach↔candidate link today. */
export async function listMyCandidates(ctx: Context, coachId: string): Promise<GraphQLCoachCandidate[]> {
  const bookings = await ctx.prisma.booking.findMany({
    where: { status: 'BOOKED', event: { coachId } },
    include: { user: { include: { profile: true } }, event: true },
  })

  return toCoachCandidates(bookings, new Date())
}

export async function getCoachDashboard(ctx: Context, coachId: string) {
  const now = new Date()
  const weekStart = startOfWeek(now)
  const weekEnd = new Date(weekStart.getTime() + 7 * DAY_MS)

  const [candidates, sessionsThisWeek, upcomingSessionsCount, upcomingEvents] = await Promise.all([
    listMyCandidates(ctx, coachId),
    ctx.prisma.calendarEvent.count({
      where: { coachId, startTime: { gte: weekStart, lt: weekEnd } },
    }),
    ctx.prisma.calendarEvent.count({
      where: { coachId, startTime: { gte: now } },
    }),
    ctx.prisma.calendarEvent.findMany({
      where: { coachId, startTime: { gte: now } },
      orderBy: { startTime: 'asc' },
      take: UPCOMING_SESSIONS_LIMIT,
    }),
  ])

  const upcomingSessions = upcomingEvents
    .map(toCoachUpcomingSession)
    .filter((session): session is GraphQLCoachUpcomingSession => session !== null)

  return {
    totalCandidates: candidates.length,
    sessionsThisWeek,
    upcomingSessionsCount,
    upcomingSessions,
    recentCandidates: candidates.slice(0, RECENT_CANDIDATES_LIMIT),
  }
}

export async function getCoachCandidate(
  ctx: Context,
  coachId: string,
  candidateId: string,
): Promise<GraphQLCoachCandidateDetail> {
  const [bookings, user, applications, goals, cv] = await Promise.all([
    ctx.prisma.booking.findMany({
      where: { userId: candidateId, status: 'BOOKED', event: { coachId } },
      include: { event: true },
    }),
    ctx.prisma.user.findUnique({ where: { id: candidateId }, include: { profile: true } }),
    ctx.prisma.application.findMany({
      where: { userId: candidateId },
      orderBy: { createdAt: 'desc' },
      take: CANDIDATE_APPLICATIONS_LIMIT,
      include: { jobOffer: true },
    }),
    ctx.prisma.goal.findMany({ where: { userId: candidateId } }),
    ctx.prisma.cv.findFirst({ where: { userId: candidateId }, orderBy: { createdAt: 'desc' } }),
  ])

  // No booking with this coach — reported as missing, not forbidden, so an id doesn't confirm a match exists.
  if (bookings.length === 0 || !user) {
    throw new GraphQLError(messages.candidateNotFound, { extensions: { code: 'CANDIDATE_NOT_FOUND' } })
  }

  return toGraphQLCoachCandidateDetail({ user, bookings, applications, goals, cv, now: new Date() })
}
