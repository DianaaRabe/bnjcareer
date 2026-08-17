import { ApplicationStatus, BookingStatus, EventType, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DAY_MS = 24 * 60 * 60 * 1000

// Fixed ids keep the seed idempotent — re-running refreshes the rows instead of duplicating them.
const ID = {
  offer: (n: number) => `a0000000-0000-4000-8000-00000000000${n}`,
  application: (n: number) => `a1000000-0000-4000-8000-00000000000${n}`,
  match: 'a2000000-0000-4000-8000-000000000001',
  event: (n: number) => `a3000000-0000-4000-8000-00000000000${n}`,
  booking: (n: number) => `a4000000-0000-4000-8000-00000000000${n}`,
}

const at = (offsetDays: number) => new Date(Date.now() + offsetDays * DAY_MS)

const offers = [
  { title: 'Développeur React', company: 'TechCorp' },
  { title: 'Frontend Engineer', company: 'Nova Studio' },
  { title: 'Intégrateur web', company: 'Atelier Digital' },
]

// One application per day for the last 3 days — drives both the applications goal and the streak.
const applications = [
  { day: 0, status: ApplicationStatus.SENT },
  { day: -1, status: ApplicationStatus.INTERVIEW },
  { day: -2, status: ApplicationStatus.PENDING },
]

const events = [
  { day: -6, title: "Atelier CV : passer les filtres ATS" },
  { day: 3, title: 'Atelier pitch : réussir son entretien' },
  { day: 9, title: 'Atelier réseau : activer LinkedIn' },
]

async function main() {
  const candidate = await prisma.user.findUnique({ where: { email: 'candidat@test.dev' } })
  const coach = await prisma.user.findUnique({ where: { email: 'coach@test.dev' } })

  if (!candidate || !coach) {
    throw new Error('Run `npm run db:seed` first — candidat@test.dev and coach@test.dev are missing.')
  }

  for (const [index, offer] of offers.entries()) {
    await prisma.jobOffer.upsert({
      where: { id: ID.offer(index + 1) },
      update: offer,
      create: { id: ID.offer(index + 1), ...offer, source: 'seed' },
    })
  }

  for (const [index, application] of applications.entries()) {
    const data = {
      userId: candidate.id,
      jobOfferId: ID.offer(index + 1),
      status: application.status,
      createdAt: at(application.day),
    }
    await prisma.application.upsert({
      where: { id: ID.application(index + 1) },
      update: data,
      create: { id: ID.application(index + 1), ...data },
    })
  }

  // Best match below the 75 threshold — the matching goal stays in progress.
  const matchData = { applicationId: ID.application(1), score: 62 }
  await prisma.matchAnalysis.upsert({
    where: { id: ID.match },
    update: matchData,
    create: { id: ID.match, ...matchData },
  })

  for (const [index, event] of events.entries()) {
    const start = at(event.day)
    const eventData = {
      coachId: coach.id,
      title: event.title,
      type: EventType.GROUP,
      startTime: start,
      endTime: new Date(start.getTime() + 90 * 60 * 1000),
    }
    await prisma.calendarEvent.upsert({
      where: { id: ID.event(index + 1) },
      update: eventData,
      create: { id: ID.event(index + 1), ...eventData },
    })

    const bookingData = {
      eventId: ID.event(index + 1),
      userId: candidate.id,
      status: BookingStatus.BOOKED,
    }
    await prisma.booking.upsert({
      where: { id: ID.booking(index + 1) },
      update: bookingData,
      create: { id: ID.booking(index + 1), ...bookingData },
    })
  }

  console.log(`✓ ${applications.length} applications, ${events.length} workshops booked`)
  console.log('Coaching seed complete for candidat@test.dev')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
