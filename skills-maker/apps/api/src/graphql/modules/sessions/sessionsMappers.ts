import type { Booking, CalendarEvent, Profile, User } from '@prisma/client'

export type SessionWithAttendeeCount = CalendarEvent & { _count: { bookings: number } }
export type BookingWithCandidate = Booking & { user: (User & { profile: Profile | null }) | null }
export type SessionWithBookings = CalendarEvent & { bookings: BookingWithCandidate[] }

export type GraphQLSessionAttendee = {
  id: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  status: Booking['status']
}

export type GraphQLCoachSession = {
  id: string
  title: string
  type: NonNullable<CalendarEvent['type']>
  status: CalendarEvent['status']
  startTime: string
  endTime: string
  attendeesCount: number
  attendees?: GraphQLSessionAttendee[]
}

export function toGraphQLSessionAttendee(booking: BookingWithCandidate): GraphQLSessionAttendee {
  return {
    id: booking.id,
    firstName: booking.user?.profile?.firstName ?? null,
    lastName: booking.user?.profile?.lastName ?? null,
    avatarUrl: booking.user?.profile?.avatarUrl ?? null,
    status: booking.status,
  }
}

/** A coach-created session always has title, type, startTime and endTime set — enforced by the create schema. */
export function toGraphQLCoachSession(event: SessionWithAttendeeCount): GraphQLCoachSession {
  return {
    id: event.id,
    title: event.title ?? '',
    type: event.type ?? 'ONE_ON_ONE',
    status: event.status,
    startTime: event.startTime?.toISOString() ?? '',
    endTime: event.endTime?.toISOString() ?? '',
    attendeesCount: event._count.bookings,
  }
}

export function toGraphQLCoachSessionDetail(event: SessionWithBookings): GraphQLCoachSession {
  return {
    id: event.id,
    title: event.title ?? '',
    type: event.type ?? 'ONE_ON_ONE',
    status: event.status,
    startTime: event.startTime?.toISOString() ?? '',
    endTime: event.endTime?.toISOString() ?? '',
    attendeesCount: event.bookings.filter((booking) => booking.status === 'BOOKED').length,
    attendees: event.bookings.map(toGraphQLSessionAttendee),
  }
}
