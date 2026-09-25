import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { toGraphQLWorkshop, type BookingWithEvent } from '../coachingMappers.js'

const START = new Date('2026-09-01T08:30:00.000Z')

const booking = (event: BookingWithEvent['event']): BookingWithEvent =>
  ({ id: 'booking-1', eventId: 'event-1', userId: 'user-1', status: 'BOOKED', event }) as BookingWithEvent

const event = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'event-1',
    coachId: 'coach-1',
    title: 'Atelier CV',
    type: 'GROUP',
    startTime: START,
    endTime: null,
    coach: null,
    ...overrides,
  }) as BookingWithEvent['event']

const coach = (firstName: string | null, lastName: string | null) => ({
  id: 'coach-1',
  profile: { firstName, lastName },
})

describe('toGraphQLWorkshop', () => {
  it('maps a booked event to its display shape', () => {
    const workshop = toGraphQLWorkshop(booking(event()))

    assert.deepEqual(workshop, {
      id: 'booking-1',
      title: 'Atelier CV',
      startsAt: START.toISOString(),
      coachName: null,
    })
  })

  it('joins the coach first and last name', () => {
    const workshop = toGraphQLWorkshop(booking(event({ coach: coach('Chris', 'Coach') })))

    assert.equal(workshop?.coachName, 'Chris Coach')
  })

  it('keeps the single name part when the other is missing', () => {
    const workshop = toGraphQLWorkshop(booking(event({ coach: coach('Chris', null) })))

    assert.equal(workshop?.coachName, 'Chris')
  })

  it('reports no coach rather than an empty string', () => {
    const workshop = toGraphQLWorkshop(booking(event({ coach: coach(null, null) })))

    assert.equal(workshop?.coachName, null)
  })

  it('skips a booking with no event attached', () => {
    assert.equal(toGraphQLWorkshop(booking(null)), null)
  })

  it('skips an event with no date — nothing to display', () => {
    assert.equal(toGraphQLWorkshop(booking(event({ startTime: null }))), null)
  })

  it('skips an untitled event', () => {
    assert.equal(toGraphQLWorkshop(booking(event({ title: null }))), null)
  })
})
