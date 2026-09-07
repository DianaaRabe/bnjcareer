import type { Booking, CalendarEvent, EventType, Profile, ProfileSituation, User } from '@prisma/client'

export type BookingWithUserAndEvent = Booking & {
  user: (User & { profile: Profile | null }) | null
  event: CalendarEvent | null
}

export type GraphQLCoachCandidate = {
  id: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  sector: string | null
  situation: ProfileSituation | null
  sessionsCount: number
  lastSessionAt: string
  /** No session left ahead of now — every past session, nothing on the calendar. */
  needsFollowUp: boolean
}

export type GraphQLCoachUpcomingSession = {
  id: string
  title: string
  startsAt: string
  type: EventType
}

/** Groups bookings by candidate, keeping every session date to derive a count and the latest one. */
export function toCoachCandidates(bookings: BookingWithUserAndEvent[], now: Date): GraphQLCoachCandidate[] {
  const byCandidate = new Map<string, { user: User & { profile: Profile | null }; sessions: Date[] }>()

  for (const booking of bookings) {
    if (!booking.user || !booking.event?.startTime) continue

    const entry = byCandidate.get(booking.user.id)
    if (entry) {
      entry.sessions.push(booking.event.startTime)
    } else {
      byCandidate.set(booking.user.id, { user: booking.user, sessions: [booking.event.startTime] })
    }
  }

  return Array.from(byCandidate.values())
    .map(({ user, sessions }) => ({
      id: user.id,
      firstName: user.profile?.firstName ?? null,
      lastName: user.profile?.lastName ?? null,
      avatarUrl: user.profile?.avatarUrl ?? null,
      sector: user.profile?.sector ?? null,
      situation: user.profile?.situation ?? null,
      sessionsCount: sessions.length,
      lastSessionAt: new Date(Math.max(...sessions.map((date) => date.getTime()))).toISOString(),
      needsFollowUp: sessions.every((date) => date.getTime() < now.getTime()),
    }))
    // Most recently active candidate first, mirroring the dashboard's recent-activity feel.
    .sort((a, b) => new Date(b.lastSessionAt).getTime() - new Date(a.lastSessionAt).getTime())
}

/** Returns null for an event missing the fields a session card needs — nothing to display. */
export function toCoachUpcomingSession(event: CalendarEvent): GraphQLCoachUpcomingSession | null {
  if (!event.startTime || !event.title || !event.type) {
    return null
  }

  return {
    id: event.id,
    title: event.title,
    startsAt: event.startTime.toISOString(),
    type: event.type,
  }
}
