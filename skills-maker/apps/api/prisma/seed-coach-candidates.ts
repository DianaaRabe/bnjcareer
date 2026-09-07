import bcrypt from 'bcryptjs'
import { ApplicationStatus, BookingStatus, EventType, ProfileSituation, PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

const DAY_MS = 24 * 60 * 60 * 1000
const at = (offsetDays: number) => new Date(Date.now() + offsetDays * DAY_MS)

// Readable, fixed ids keep the seed idempotent — re-running refreshes rows instead of duplicating them.
const id = (kind: string, slug: string) => `seed-coach-candidates-${kind}-${slug}`

type SessionSeed = { day: number; title: string }
type ApplicationSeed = { title: string; company: string; status: ApplicationStatus; matchScore: number | null; day: number }
type GoalSeed = { title: string; progress: number; target: number | null }

type CandidateSeed = {
  slug: string
  email: string
  firstName: string
  lastName: string
  bio: string | null
  sector: string
  situation: ProfileSituation
  sessions: SessionSeed[]
  applications: ApplicationSeed[]
  goals: GoalSeed[]
}

const CANDIDATES: CandidateSeed[] = [
  {
    slug: 'lucie',
    email: 'lucie.bernard@seed.dev',
    firstName: 'Lucie',
    lastName: 'Bernard',
    bio: "En reconversion vers le marketing digital après 6 ans en grande distribution. Motivée, curieuse, à l'aise avec les outils d'analyse.",
    sector: 'Marketing / E-commerce',
    situation: ProfileSituation.JOB_SEARCH,
    sessions: [
      { day: -10, title: 'Bilan de compétences' },
      { day: -3, title: 'Préparation entretien' },
      { day: 5, title: 'Suivi mensuel' },
    ],
    applications: [
      { title: 'Chargée de marketing digital', company: 'Ecomly', status: ApplicationStatus.INTERVIEW, matchScore: 84, day: -2 },
      { title: 'Community manager', company: 'Studio Nova', status: ApplicationStatus.SENT, matchScore: 71, day: -6 },
      { title: 'Chef de projet e-commerce', company: 'Boutique Plus', status: ApplicationStatus.REJECTED, matchScore: 58, day: -14 },
    ],
    goals: [
      { title: 'CV optimisé', progress: 100, target: 100 },
      { title: 'Candidatures cette semaine', progress: 3, target: 5 },
    ],
  },
  {
    slug: 'marc',
    email: 'marc.lefevre@seed.dev',
    firstName: 'Marc',
    lastName: 'Lefèvre',
    bio: "Contrôleur de gestion senior en reconversion vers la direction financière de PME. 10 ans dans le secteur bancaire.",
    sector: 'Finance',
    situation: ProfileSituation.RECONVERSION,
    sessions: [
      { day: -20, title: 'Premier rendez-vous' },
      { day: -8, title: "Stratégie de recherche" },
    ],
    applications: [{ title: 'Directeur financier', company: 'Groupe Ardan', status: ApplicationStatus.PENDING, matchScore: 66, day: -5 }],
    goals: [{ title: 'Réseau LinkedIn développé', progress: 40, target: 100 }],
  },
  {
    slug: 'sophie',
    email: 'sophie.martin@seed.dev',
    firstName: 'Sophie',
    lastName: 'Martin',
    bio: null,
    sector: 'Ressources Humaines',
    situation: ProfileSituation.STUDENT,
    sessions: [{ day: -25, title: "Découverte de l'accompagnement" }],
    applications: [],
    goals: [],
  },
  {
    slug: 'karim',
    email: 'karim.haddad@seed.dev',
    firstName: 'Karim',
    lastName: 'Haddad',
    bio: "Ingénieur DevOps avec 8 ans d'expérience sur des infrastructures cloud à grande échelle. Je cherche un poste avec plus de responsabilités techniques et une équipe à encadrer, idéalement dans une scale-up.",
    sector: 'Tech / DevOps',
    situation: ProfileSituation.EMPLOYED,
    sessions: [
      { day: -15, title: 'Clarification du projet' },
      { day: 2, title: 'Négociation salariale' },
      { day: 12, title: 'Simulation entretien technique' },
    ],
    applications: [
      { title: 'Lead DevOps', company: 'CloudNine', status: ApplicationStatus.INTERVIEW, matchScore: 91, day: -1 },
      { title: 'Site Reliability Engineer', company: 'Northbeam', status: ApplicationStatus.SENT, matchScore: 79, day: -3 },
      { title: 'Ingénieur Plateforme', company: 'Vertex', status: ApplicationStatus.SENT, matchScore: 75, day: -4 },
      { title: 'DevOps Manager', company: 'Fintra', status: ApplicationStatus.PENDING, matchScore: 68, day: -9 },
      { title: 'Architecte Cloud', company: 'Solren', status: ApplicationStatus.REJECTED, matchScore: 55, day: -18 },
      { title: 'Ingénieur SRE Senior', company: 'Datawise', status: ApplicationStatus.SENT, matchScore: null, day: -22 },
    ],
    goals: [
      { title: 'CV optimisé', progress: 100, target: 100 },
      { title: 'Score matching cible', progress: 82, target: 90 },
      { title: 'Entretiens obtenus', progress: 1, target: 3 },
    ],
  },
  {
    slug: 'julie',
    email: 'julie.petit@seed.dev',
    firstName: 'Julie',
    lastName: 'Petit',
    bio: "Chargée de communication cherchant une opportunité dans le secteur associatif ou l'impact social.",
    sector: 'Communication',
    situation: ProfileSituation.JOB_SEARCH,
    sessions: [{ day: 7, title: 'Premier rendez-vous' }],
    applications: [
      { title: 'Chargée de communication', company: 'Fondation Elan', status: ApplicationStatus.SENT, matchScore: 73, day: -1 },
      { title: 'Responsable communication', company: 'Alter Asso', status: ApplicationStatus.PENDING, matchScore: 69, day: -7 },
    ],
    goals: [],
  },
]

async function main() {
  const coach = await prisma.user.findUnique({ where: { email: 'coach@test.dev' } })
  if (!coach) {
    throw new Error('Run `npm run db:seed` first — coach@test.dev is missing.')
  }

  const passwordHash = await bcrypt.hash('password123', 10)

  for (const candidate of CANDIDATES) {
    const user = await prisma.user.upsert({
      where: { email: candidate.email },
      update: {},
      create: { id: id('user', candidate.slug), email: candidate.email, passwordHash, role: Role.CANDIDATE },
    })

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        bio: candidate.bio,
        sector: candidate.sector,
        situation: candidate.situation,
      },
      create: {
        userId: user.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        bio: candidate.bio,
        sector: candidate.sector,
        situation: candidate.situation,
      },
    })

    for (const [index, session] of candidate.sessions.entries()) {
      const start = at(session.day)
      const eventId = id('event', `${candidate.slug}-${index + 1}`)
      await prisma.calendarEvent.upsert({
        where: { id: eventId },
        update: { coachId: coach.id, title: session.title, type: EventType.ONE_ON_ONE, startTime: start },
        create: {
          id: eventId,
          coachId: coach.id,
          title: session.title,
          type: EventType.ONE_ON_ONE,
          startTime: start,
          endTime: new Date(start.getTime() + 60 * 60 * 1000),
        },
      })

      const bookingId = id('booking', `${candidate.slug}-${index + 1}`)
      await prisma.booking.upsert({
        where: { id: bookingId },
        update: { eventId, userId: user.id, status: BookingStatus.BOOKED },
        create: { id: bookingId, eventId, userId: user.id, status: BookingStatus.BOOKED },
      })
    }

    for (const [index, application] of candidate.applications.entries()) {
      const offerId = id('offer', `${candidate.slug}-${index + 1}`)
      await prisma.jobOffer.upsert({
        where: { id: offerId },
        update: { title: application.title, company: application.company },
        create: { id: offerId, title: application.title, company: application.company, source: 'seed' },
      })

      const applicationId = id('application', `${candidate.slug}-${index + 1}`)
      await prisma.application.upsert({
        where: { id: applicationId },
        update: {
          userId: user.id,
          jobOfferId: offerId,
          status: application.status,
          matchScore: application.matchScore,
          createdAt: at(application.day),
        },
        create: {
          id: applicationId,
          userId: user.id,
          jobOfferId: offerId,
          status: application.status,
          matchScore: application.matchScore,
          createdAt: at(application.day),
        },
      })
    }

    for (const [index, goal] of candidate.goals.entries()) {
      const goalId = id('goal', `${candidate.slug}-${index + 1}`)
      await prisma.goal.upsert({
        where: { id: goalId },
        update: { userId: user.id, title: goal.title, progress: goal.progress, target: goal.target },
        create: { id: goalId, userId: user.id, title: goal.title, progress: goal.progress, target: goal.target },
      })
    }
  }

  console.log(`✓ ${CANDIDATES.length} candidates seeded for coach@test.dev`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
