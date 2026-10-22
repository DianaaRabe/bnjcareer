import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Context } from '@/context.js'
import { cancelBooking, cancelSession, createSession, getMySession, listMySessions, updateSession } from '../sessionsService.js'

const sessionRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'session-1',
  coachId: 'coach-1',
  title: 'Point de suivi',
  type: 'ONE_ON_ONE',
  status: 'SCHEDULED',
  startTime: new Date('2026-10-01T10:00:00.000Z'),
  endTime: new Date('2026-10-01T11:00:00.000Z'),
  _count: { bookings: 0 },
  ...overrides,
})

const bookingRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'booking-1',
  eventId: 'session-1',
  userId: 'candidate-1',
  status: 'BOOKED',
  user: null,
  ...overrides,
})

type WriteArgs = { data: Record<string, unknown>; where?: Record<string, unknown> }

type Calls = {
  findMany: Record<string, unknown>[]
  findFirst: Record<string, unknown>[]
  create: WriteArgs[]
  update: WriteArgs[]
  bookingFindFirst: Record<string, unknown>[]
  bookingUpdate: WriteArgs[]
}

const contextWith = (fixture: {
  sessions?: Record<string, unknown>[]
  session?: Record<string, unknown> | null
  createdSession?: Record<string, unknown>
  updatedSession?: Record<string, unknown>
  booking?: Record<string, unknown> | null
}) => {
  const calls: Calls = {
    findMany: [],
    findFirst: [],
    create: [],
    update: [],
    bookingFindFirst: [],
    bookingUpdate: [],
  }

  const prisma = {
    calendarEvent: {
      findMany: async (args: Record<string, unknown>) => {
        calls.findMany.push(args)
        return fixture.sessions ?? []
      },
      findFirst: async (args: Record<string, unknown>) => {
        calls.findFirst.push(args)
        return fixture.session ?? null
      },
      create: async (args: WriteArgs) => {
        calls.create.push(args)
        return fixture.createdSession ?? sessionRow()
      },
      update: async (args: WriteArgs) => {
        calls.update.push(args)
        return fixture.updatedSession ?? sessionRow()
      },
    },
    booking: {
      findFirst: async (args: Record<string, unknown>) => {
        calls.bookingFindFirst.push(args)
        return fixture.booking ?? null
      },
      update: async (args: WriteArgs) => {
        calls.bookingUpdate.push(args)
        return bookingRow()
      },
    },
  }

  return { ctx: { prisma, user: null, audit: {} } as unknown as Context, calls }
}

describe('listMySessions', () => {
  it('scopes the query to the authenticated coach', async () => {
    const { ctx, calls } = contextWith({})

    await listMySessions(ctx, 'coach-1')

    assert.deepEqual(calls.findMany[0]?.where, { coachId: 'coach-1' })
  })
})

describe('getMySession', () => {
  it('reports a session owned by another coach as missing, never as forbidden', async () => {
    const { ctx } = contextWith({ session: null })

    await assert.rejects(() => getMySession(ctx, 'coach-1', 'session-1'), /Session not found/)
  })
})

describe('createSession', () => {
  const validInput = { title: 'Point de suivi', type: 'ONE_ON_ONE', startTime: '2026-10-01T10:00:00.000Z', endTime: '2026-10-01T11:00:00.000Z' }

  it('owns the session with the calling coach, not a client-supplied id', async () => {
    const { ctx, calls } = contextWith({})

    await createSession(ctx, 'coach-1', validInput)

    assert.equal(calls.create[0]?.data.coachId, 'coach-1')
  })

  it('rejects a blank title', async () => {
    const { ctx } = contextWith({})

    await assert.rejects(() => createSession(ctx, 'coach-1', { ...validInput, title: '   ' }), /Invalid session data/)
  })

  it('rejects an end time before the start time', async () => {
    const { ctx } = contextWith({})

    await assert.rejects(
      () => createSession(ctx, 'coach-1', { ...validInput, startTime: '2026-10-01T11:00:00.000Z', endTime: '2026-10-01T10:00:00.000Z' }),
      /Invalid session data/,
    )
  })
})

describe('updateSession', () => {
  it('refuses to update a session that belongs to another coach', async () => {
    const { ctx } = contextWith({ session: null })

    await assert.rejects(() => updateSession(ctx, 'coach-1', 'session-1', { title: 'New title' }), /Session not found/)
  })

  it('leaves omitted fields untouched', async () => {
    const { ctx, calls } = contextWith({ session: sessionRow() })

    await updateSession(ctx, 'coach-1', 'session-1', { title: 'New title' })

    assert.deepEqual(calls.update[0]?.data, { title: 'New title' })
  })
})

describe('cancelSession', () => {
  it('refuses to cancel a session that belongs to another coach', async () => {
    const { ctx } = contextWith({ session: null })

    await assert.rejects(() => cancelSession(ctx, 'coach-1', 'session-1'), /Session not found/)
  })

  it('soft-cancels once ownership is confirmed, rather than removing the row', async () => {
    const { ctx, calls } = contextWith({ session: sessionRow() })

    const result = await cancelSession(ctx, 'coach-1', 'session-1')

    assert.equal(result, true)
    assert.deepEqual(calls.update[0]?.where, { id: 'session-1' })
    assert.deepEqual(calls.update[0]?.data, { status: 'CANCELED' })
  })
})

describe('cancelBooking', () => {
  it('refuses a booking on a session owned by another coach', async () => {
    const { ctx } = contextWith({ booking: null })

    await assert.rejects(() => cancelBooking(ctx, 'coach-1', 'booking-1'), /Booking not found/)
  })

  it('scopes the lookup through the session ownership', async () => {
    const { ctx, calls } = contextWith({ booking: bookingRow() })

    await cancelBooking(ctx, 'coach-1', 'booking-1')

    assert.deepEqual(calls.bookingFindFirst[0]?.where, { id: 'booking-1', event: { coachId: 'coach-1' } })
    assert.deepEqual(calls.bookingUpdate[0]?.data, { status: 'CANCELED' })
  })
})
