import type { Booking, CalendarEvent, Profile, User } from '@prisma/client'

export type BookingWithEvent = Booking & {
  event: (CalendarEvent & { coach: (User & { profile: Profile | null }) | null }) | null
}

export type CoachingWorkshop = {
  id: string
  title: string
  startsAt: string
  coachName: string | null
}

const coachName = (profile: Profile | null | undefined) => {
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ')
  return name.length > 0 ? name : null
}

/** Returns null for bookings whose event lacks a date or a title — nothing to display. */
export function toGraphQLWorkshop(booking: BookingWithEvent): CoachingWorkshop | null {
  const event = booking.event
  if (!event?.startTime || !event.title) {
    return null
  }

  return {
    id: booking.id,
    title: event.title,
    startsAt: event.startTime.toISOString(),
    coachName: coachName(event.coach?.profile),
  }
}
