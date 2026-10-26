import type {
  Application,
  ApplicationStatus,
  Booking,
  CalendarEvent,
  Cv,
  CvStatus,
  EventType,
  Goal,
  JobOffer,
  Profile,
  ProfileSituation,
  User,
} from '@prisma/client'

export type BookingWithUserAndEvent = Booking & {
  user: (User & { profile: Profile | null }) | null
  event: CalendarEvent | null
}

export type GraphQLCoachCandidate = {
  id: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  bio: string | null
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
      bio: user.profile?.bio ?? null,
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

export type GraphQLCoachCandidateApplication = {
  id: string
  jobTitle: string | null
  company: string | null
  status: ApplicationStatus
  matchScore: number | null
  createdAt: string
}

export type GraphQLCoachCandidateGoal = {
  id: string
  title: string | null
  progress: number
  target: number | null
}

export type GraphQLCoachCandidateDetail = {
  id: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  bio: string | null
  sector: string | null
  situation: ProfileSituation | null
  cvStatus: CvStatus | null
  sessionsCount: number
  lastSessionAt: string | null
  nextSessionAt: string | null
  applications: GraphQLCoachCandidateApplication[]
  goals: GraphQLCoachCandidateGoal[]
}

export function toGraphQLCoachCandidateApplication(
  application: Application & { jobOffer: JobOffer | null },
): GraphQLCoachCandidateApplication {
  return {
    id: application.id,
    jobTitle: application.jobOffer?.title ?? null,
    company: application.jobOffer?.company ?? null,
    status: application.status,
    matchScore: application.matchScore,
    createdAt: application.createdAt.toISOString(),
  }
}

export function toGraphQLCoachCandidateGoal(goal: Goal): GraphQLCoachCandidateGoal {
  return { id: goal.id, title: goal.title, progress: goal.progress, target: goal.target }
}

/** Earliest date at/after `now`, or the latest one before it — null when the list is empty. */
function pickSession(dates: Date[], now: Date, direction: 'next' | 'last'): string | null {
  const relevant =
    direction === 'next'
      ? dates.filter((date) => date.getTime() >= now.getTime())
      : dates.filter((date) => date.getTime() < now.getTime())

  if (relevant.length === 0) return null

  const picked =
    direction === 'next'
      ? Math.min(...relevant.map((date) => date.getTime()))
      : Math.max(...relevant.map((date) => date.getTime()))

  return new Date(picked).toISOString()
}

export function toGraphQLCoachCandidateDetail(input: {
  user: User & { profile: Profile | null }
  bookings: (Booking & { event: CalendarEvent | null })[]
  applications: (Application & { jobOffer: JobOffer | null })[]
  goals: Goal[]
  cv: Cv | null
  now: Date
}): GraphQLCoachCandidateDetail {
  const { user, bookings, applications, goals, cv, now } = input
  const sessionDates = bookings
    .map((booking) => booking.event?.startTime)
    .filter((date): date is Date => Boolean(date))

  return {
    id: user.id,
    firstName: user.profile?.firstName ?? null,
    lastName: user.profile?.lastName ?? null,
    avatarUrl: user.profile?.avatarUrl ?? null,
    bio: user.profile?.bio ?? null,
    sector: user.profile?.sector ?? null,
    situation: user.profile?.situation ?? null,
    cvStatus: cv?.status ?? null,
    sessionsCount: sessionDates.length,
    lastSessionAt: pickSession(sessionDates, now, 'last'),
    nextSessionAt: pickSession(sessionDates, now, 'next'),
    applications: applications.map(toGraphQLCoachCandidateApplication),
    goals: goals.map(toGraphQLCoachCandidateGoal),
  }
}
