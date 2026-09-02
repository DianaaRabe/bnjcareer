import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Context } from '@/context.js'
import { getCoachingOverview } from '../coachingService.js'

const DAY_MS = 24 * 60 * 60 * 1000
const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS)
const inDays = (days: number) => new Date(Date.now() + days * DAY_MS)

type Fixture = {
  cvStatus?: string
  applications?: { status: string; createdAt: Date }[]
  attendedWorkshops?: number
  bestMatchScore?: number | null
  upcoming?: { title: string | null; startTime: Date | null }[]
}

/** Minimal Prisma stub — the service only ever reads, so returning plain rows is enough. */
const contextWith = (fixture: Fixture) => {
  const calls: Record<string, unknown[]> = { bookingWhere: [] }

  const prisma = {
    cv: {
      findFirst: async () => (fixture.cvStatus ? { status: fixture.cvStatus } : null),
    },
    application: {
      findMany: async () => fixture.applications ?? [],
    },
    booking: {
      count: async ({ where }: { where: unknown }) => {
        calls.bookingWhere.push(where)
        return fixture.attendedWorkshops ?? 0
      },
      findMany: async () =>
        (fixture.upcoming ?? []).map((event, index) => ({
          id: `booking-${index}`,
          event: { ...event, coach: null },
        })),
    },
    matchAnalysis: {
      aggregate: async () => ({ _max: { score: fixture.bestMatchScore ?? null } }),
    },
  }

  return { ctx: { prisma, user: null } as unknown as Context, calls }
}

const goalOf = (goals: { key: string }[], key: string) => {
  const goal = goals.find((candidate) => candidate.key === key)
  assert.ok(goal, `missing goal ${key}`)
  return goal as { key: string; done: boolean; progress: number | null }
}

describe('getCoachingOverview', () => {
  it('returns an empty journey for a candidate with no data', async () => {
    const { ctx } = contextWith({})

    const overview = await getCoachingOverview(ctx, 'user-1')

    assert.deepEqual(overview.workshops, [])
    assert.equal(overview.streakDays, 0)
    assert.equal(overview.score.points, 0)
    assert.equal(overview.score.max, 220)
    assert.ok(overview.goals.every((goal) => !goal.done))
  })

  it('maps each CV status onto its pipeline stage', async () => {
    const stages: [string, boolean, number | null][] = [
      ['UPLOADED', false, 33],
      ['EXTRACTED', false, 67],
      ['OPTIMIZING', false, 67],
      ['OPTIMIZED', true, null],
    ]

    for (const [status, done, progress] of stages) {
      const { ctx } = contextWith({ cvStatus: status })
      const overview = await getCoachingOverview(ctx, 'user-1')

      assert.equal(goalOf(overview.goals, 'CV').done, done, status)
      assert.equal(goalOf(overview.goals, 'CV').progress, progress, status)
    }
  })

  it('derives the application count and the interview goal from one read', async () => {
    const { ctx } = contextWith({
      applications: [
        { status: 'SENT', createdAt: daysAgo(0) },
        { status: 'INTERVIEW', createdAt: daysAgo(1) },
      ],
    })

    const overview = await getCoachingOverview(ctx, 'user-1')

    assert.equal(goalOf(overview.goals, 'APPLICATIONS').progress, 40)
    assert.equal(goalOf(overview.goals, 'INTERVIEW').done, true)
  })

  it('builds the streak from the application dates', async () => {
    const { ctx } = contextWith({
      applications: [
        { status: 'SENT', createdAt: daysAgo(0) },
        { status: 'SENT', createdAt: daysAgo(1) },
        { status: 'SENT', createdAt: daysAgo(2) },
        { status: 'SENT', createdAt: daysAgo(9) },
      ],
    })

    const overview = await getCoachingOverview(ctx, 'user-1')

    assert.equal(overview.streakDays, 3)
  })

  it('unlocks the workshop goal from past attendance, not from upcoming bookings', async () => {
    const { ctx } = contextWith({
      attendedWorkshops: 1,
      upcoming: [{ title: 'Atelier pitch', startTime: inDays(3) }],
    })

    const overview = await getCoachingOverview(ctx, 'user-1')

    assert.equal(goalOf(overview.goals, 'WORKSHOP').done, true)
    assert.equal(overview.workshops.length, 1)
  })

  it('counts attendance only on events already started', async () => {
    const { ctx, calls } = contextWith({})

    await getCoachingOverview(ctx, 'user-1')

    const [where] = calls.bookingWhere as [{ status: string; event: { startTime: { lt: Date } } }]
    assert.equal(where.status, 'BOOKED')
    assert.ok(where.event.startTime.lt instanceof Date)
  })

  it('drops upcoming bookings whose event is unusable', async () => {
    const { ctx } = contextWith({
      upcoming: [
        { title: 'Atelier pitch', startTime: inDays(2) },
        { title: null, startTime: inDays(4) },
        { title: 'Atelier sans date', startTime: null },
      ],
    })

    const overview = await getCoachingOverview(ctx, 'user-1')

    assert.equal(overview.workshops.length, 1)
    assert.equal(overview.workshops[0].title, 'Atelier pitch')
  })

  it('scores a fully engaged candidate at the maximum', async () => {
    const { ctx } = contextWith({
      cvStatus: 'OPTIMIZED',
      applications: [
        { status: 'INTERVIEW', createdAt: daysAgo(0) },
        { status: 'SENT', createdAt: daysAgo(1) },
        { status: 'SENT', createdAt: daysAgo(2) },
        { status: 'SENT', createdAt: daysAgo(3) },
        { status: 'SENT', createdAt: daysAgo(4) },
      ],
      attendedWorkshops: 2,
      bestMatchScore: 91,
    })

    const overview = await getCoachingOverview(ctx, 'user-1')

    assert.equal(overview.score.points, 220)
    assert.equal(overview.score.percent, 100)
    assert.equal(overview.streakDays, 5)
  })
})
