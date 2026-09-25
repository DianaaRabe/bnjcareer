import type { CvStatus } from '@prisma/client'
import type { Context } from '@/context.js'
import {
  RECENT_APPLICATIONS_LIMIT,
  STREAK_LOOKBACK_DAYS,
  UPCOMING_WORKSHOPS_LIMIT,
} from './coachingConstants.js'
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

  const [cv, applications, recentApplications, attendedWorkshopCount, match, bookings] = await Promise.all([
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
    // Newest applications for the dashboard preview — needs the offer's title/company.
    ctx.prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: RECENT_APPLICATIONS_LIMIT,
      select: {
        id: true,
        status: true,
        createdAt: true,
        jobOffer: { select: { title: true, company: true } },
      },
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

  const applicationCount = applications.length
  const interviewCount = applications.filter(({ status }) => status === 'INTERVIEW').length
  const bestMatchScore = match._max.score

  const goals = buildGoals({
    cvStage: cv ? CV_STAGE_BY_STATUS[cv.status] : 0,
    applicationCount,
    interviewCount,
    attendedWorkshopCount,
    bestMatchScore,
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
    // Headline counters the candidate dashboard reads directly — all derived from real rows.
    stats: {
      applicationCount,
      interviewCount,
      bestMatchScore: bestMatchScore != null ? Math.round(bestMatchScore) : 0,
      attendedWorkshopCount,
    },
    recentApplications: recentApplications
      .filter((application) => application.jobOffer != null)
      .map((application) => ({
        id: application.id,
        title: application.jobOffer!.title,
        company: application.jobOffer!.company,
        status: application.status,
        appliedAt: application.createdAt.toISOString(),
      })),
  }
}
