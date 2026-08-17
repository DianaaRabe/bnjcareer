import type { CvStatus } from '@prisma/client'
import type { Context } from '@/context.js'
import { STREAK_LOOKBACK_DAYS, UPCOMING_WORKSHOPS_LIMIT } from './coachingConstants.js'
import { buildGoals, computeScore } from './coachingGoals.js'
import { toGraphQLWorkshop, type CoachingWorkshop } from './coachingMappers.js'
import { computeStreakDays } from './coachingStreak.js'

const DAY_MS = 24 * 60 * 60 * 1000

/** Where each CV status sits in the upload → extract → optimize pipeline. */
const CV_STAGE_BY_STATUS: Record<CvStatus, number> = {
  UPLOADED: 1,
  EXTRACTING: 1,
  EXTRACTION_FAILED: 1,
  EXTRACTED: 2,
  OPTIMIZING: 2,
  OPTIMIZATION_FAILED: 2,
  OPTIMIZED: 3,
}

export async function getCoachingOverview(ctx: Context, userId: string) {
  const now = new Date()
  const streakSince = new Date(now.getTime() - STREAK_LOOKBACK_DAYS * DAY_MS)

  const [cv, applications, attendedWorkshopCount, match, bookings] = await Promise.all([
    ctx.prisma.cv.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { status: true },
    }),
    // One read serves three signals — total, interviews and streak — instead of three round trips.
    ctx.prisma.application.findMany({
      where: { userId },
      select: { status: true, createdAt: true },
    }),
    ctx.prisma.booking.count({
      where: { userId, status: 'BOOKED', event: { startTime: { lt: now } } },
    }),
    ctx.prisma.matchAnalysis.aggregate({
      where: { application: { userId } },
      _max: { score: true },
    }),
    ctx.prisma.booking.findMany({
      where: { userId, status: 'BOOKED', event: { startTime: { gte: now } } },
      orderBy: { event: { startTime: 'asc' } },
      take: UPCOMING_WORKSHOPS_LIMIT,
      include: { event: { include: { coach: { include: { profile: true } } } } },
    }),
  ])

  const goals = buildGoals({
    cvStage: cv ? CV_STAGE_BY_STATUS[cv.status] : 0,
    applicationCount: applications.length,
    interviewCount: applications.filter(({ status }) => status === 'INTERVIEW').length,
    attendedWorkshopCount,
    bestMatchScore: match._max.score,
  })

  const workshops = bookings
    .map(toGraphQLWorkshop)
    .filter((workshop): workshop is CoachingWorkshop => workshop !== null)

  return {
    workshops,
    goals,
    score: computeScore(goals),
    streakDays: computeStreakDays(
      applications
        .map(({ createdAt }) => createdAt)
        .filter((createdAt) => createdAt >= streakSince),
      now,
    ),
  }
}
