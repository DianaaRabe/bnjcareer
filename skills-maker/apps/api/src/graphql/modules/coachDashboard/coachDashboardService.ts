import type { Context } from '@/context.js'
import { RECENT_CANDIDATES_LIMIT, UPCOMING_SESSIONS_LIMIT } from './coachDashboardConstants.js'
import {
  toCoachCandidates,
  toCoachUpcomingSession,
  type GraphQLCoachCandidate,
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
