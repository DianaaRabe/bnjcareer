import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Context } from '@/context.js'
import { RECENT_CANDIDATES_LIMIT, UPCOMING_SESSIONS_LIMIT } from '../coachDashboardConstants.js'
import { getCoachDashboard, listMyCandidates } from '../coachDashboardService.js'

type BookingRow = {
  id: string
  userId: string
  event: { startTime: Date } | null
  user: { id: string; profile: Record<string, unknown> | null } | null
}

const candidate = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  profile: { firstName: 'Alice', lastName: 'Dupont', avatarUrl: null, sector: 'Tech', situation: 'JOB_SEARCH' },
  ...overrides,
})

const booking = (id: string, userId: string, startTime: Date, overrides: Partial<BookingRow> = {}) => ({
  id,
  userId,
  user: candidate(userId),
  event: { startTime },
  ...overrides,
})

const contextWithBookings = (bookings: BookingRow[]) => {
  const calls: { findManyWhere?: Record<string, unknown> } = {}

  const prisma = {
    booking: {
      findMany: async (args: { where: Record<string, unknown> }) => {
        calls.findManyWhere = args.where
        return bookings
      },
    },
  }

  return { ctx: { prisma, user: null, audit: {} } as unknown as Context, calls }
}

describe('listMyCandidates', () => {
  it('groups sessions by candidate and keeps the most recent date', async () => {
    const { ctx } = contextWithBookings([
      booking('b1', 'user-1', new Date('2026-08-01T10:00:00.000Z')),
      booking('b2', 'user-1', new Date('2026-08-10T10:00:00.000Z')),
    ])

    const candidates = await listMyCandidates(ctx, 'coach-1')

    assert.equal(candidates.length, 1)
    assert.equal(candidates[0]?.sessionsCount, 2)
    assert.equal(candidates[0]?.lastSessionAt, '2026-08-10T10:00:00.000Z')
  })

  it('filters bookings on this coach only, scoped to BOOKED status', async () => {
    const { ctx, calls } = contextWithBookings([])

    await listMyCandidates(ctx, 'coach-1')

    assert.deepEqual(calls.findManyWhere, { status: 'BOOKED', event: { coachId: 'coach-1' } })
  })

  it('ignores a booking whose user or event date is missing', async () => {
    const { ctx } = contextWithBookings([
      booking('b1', 'user-1', new Date('2026-08-01T10:00:00.000Z'), { user: null }),
      { id: 'b2', userId: 'user-2', user: candidate('user-2'), event: null },
    ])

    const candidates = await listMyCandidates(ctx, 'coach-1')

    assert.equal(candidates.length, 0)
  })

  it('lists the most recently active candidate first', async () => {
    const { ctx } = contextWithBookings([
      booking('b1', 'user-old', new Date('2026-01-01T10:00:00.000Z')),
      booking('b2', 'user-new', new Date('2026-08-01T10:00:00.000Z')),
    ])

    const candidates = await listMyCandidates(ctx, 'coach-1')

    assert.deepEqual(candidates.map((c) => c.id), ['user-new', 'user-old'])
  })

  it('flags a candidate whose every session is behind us', async () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const { ctx } = contextWithBookings([booking('b1', 'user-1', oneDayAgo)])

    const candidates = await listMyCandidates(ctx, 'coach-1')

    assert.equal(candidates[0]?.needsFollowUp, true)
  })

  it('does not flag a candidate who still has a session ahead', async () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const oneDayAhead = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const { ctx } = contextWithBookings([
      booking('b1', 'user-1', oneDayAgo),
      booking('b2', 'user-1', oneDayAhead),
    ])

    const candidates = await listMyCandidates(ctx, 'coach-1')

    assert.equal(candidates[0]?.needsFollowUp, false)
  })
})

const contextForDashboard = (options: {
  bookings?: BookingRow[]
  sessionsThisWeek?: number
  upcomingCount?: number
  upcomingEvents?: { id: string; title: string; startTime: Date; type: string }[]
}) => {
  const calendarEventCountCalls: Record<string, unknown>[] = []
  let findManyArgs: Record<string, unknown> | undefined

  const prisma = {
    booking: {
      findMany: async () => options.bookings ?? [],
    },
    calendarEvent: {
      count: async (args: { where: Record<string, unknown> }) => {
        calendarEventCountCalls.push(args.where)
        // First call in the service is the "this week" window, second is "from now on".
        return calendarEventCountCalls.length === 1
          ? (options.sessionsThisWeek ?? 0)
          : (options.upcomingCount ?? 0)
      },
      findMany: async (args: Record<string, unknown>) => {
        findManyArgs = args
        return options.upcomingEvents ?? []
      },
    },
  }

  return {
    ctx: { prisma, user: null, audit: {} } as unknown as Context,
    calendarEventCountCalls,
    getFindManyArgs: () => findManyArgs,
  }
}

describe('getCoachDashboard', () => {
  it('reports the candidate count alongside session stats', async () => {
    const { ctx } = contextForDashboard({
      bookings: [booking('b1', 'user-1', new Date('2026-08-01T10:00:00.000Z'))],
      sessionsThisWeek: 2,
      upcomingCount: 5,
    })

    const overview = await getCoachDashboard(ctx, 'coach-1')

    assert.equal(overview.totalCandidates, 1)
    assert.equal(overview.sessionsThisWeek, 2)
    assert.equal(overview.upcomingSessionsCount, 5)
  })

  it('caps recentCandidates at the configured limit', async () => {
    const bookings = Array.from({ length: RECENT_CANDIDATES_LIMIT + 3 }, (_, index) =>
      booking(`b${index}`, `user-${index}`, new Date(2026, 0, index + 1)),
    )
    const { ctx } = contextForDashboard({ bookings })

    const overview = await getCoachDashboard(ctx, 'coach-1')

    assert.equal(overview.recentCandidates.length, RECENT_CANDIDATES_LIMIT)
  })

  it('drops an upcoming event missing the fields a session card needs', async () => {
    const { ctx } = contextForDashboard({
      upcomingEvents: [
        { id: 'e1', title: 'Coaching 1:1', startTime: new Date('2026-09-05T09:00:00.000Z'), type: 'ONE_ON_ONE' },
        { id: 'e2', title: '', startTime: new Date('2026-09-06T09:00:00.000Z'), type: 'GROUP' },
      ] as never,
    })

    const overview = await getCoachDashboard(ctx, 'coach-1')

    assert.deepEqual(
      overview.upcomingSessions.map((session) => session.id),
      ['e1'],
    )
  })

  it('delegates the display cap to the query itself, ordered soonest first', async () => {
    const { ctx, getFindManyArgs } = contextForDashboard({})

    await getCoachDashboard(ctx, 'coach-1')

    assert.deepEqual(getFindManyArgs()?.orderBy, { startTime: 'asc' })
    assert.equal(getFindManyArgs()?.take, UPCOMING_SESSIONS_LIMIT)
  })
})
