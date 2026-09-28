import { PrismaClient } from '@prisma/client'
import { seedEmails, seedIdPrefix } from './seed-ids'

const prisma = new PrismaClient()

// ─────────────────────────────────────────────────────────────
// One script to remove EVERY dev-phase seed, in a foreign-key-safe order.
//
// It only ever touches rows whose ids/emails are declared in `seed-ids.ts`, so it
// cannot delete real user data by accident. Guards:
//   • CONFIRM_TEARDOWN=yes      required — refuses to run otherwise.
//   • REMOVE_BASE_USERS=yes     also drop candidat@/coach@/admin@test.dev logins
//                               (off by default so the demo can still sign in).
//
// Run: CONFIRM_TEARDOWN=yes npm run db:teardown -w apps/api
// ─────────────────────────────────────────────────────────────

const byPrefix = (prefix: string) => ({ id: { startsWith: prefix } })

async function main() {
  if (process.env.CONFIRM_TEARDOWN !== 'yes') {
    throw new Error(
      'Refusing to run: set CONFIRM_TEARDOWN=yes to delete all seed data.\n' +
        'This targets the DATABASE_URL database (production Supabase in this project).',
    )
  }

  const removeBaseUsers = process.env.REMOVE_BASE_USERS === 'yes'
  const log = (label: string, count: number) => console.log(`  − ${label.padEnd(22)} ${count}`)

  // Children first, parents last — none of these FKs cascade except the ones noted.

  // 1. match_analyses → applications (blocks application delete)
  log('match_analyses', (await prisma.matchAnalysis.deleteMany({
    where: { id: { startsWith: seedIdPrefix.coachingMatch } },
  })).count)

  // 2. bookings → calendar_events, users
  for (const prefix of [seedIdPrefix.coachingBooking, seedIdPrefix.coachCandidate]) {
    log('bookings', (await prisma.booking.deleteMany({ where: byPrefix(prefix) })).count)
  }

  // 3. applications → users, job_offers
  for (const prefix of [seedIdPrefix.coachingApplication, seedIdPrefix.coachCandidate]) {
    log('applications', (await prisma.application.deleteMany({ where: byPrefix(prefix) })).count)
  }

  // 4. calendar_events → users (coach)
  for (const prefix of [seedIdPrefix.coachingEvent, seedIdPrefix.coachCandidate]) {
    log('calendar_events', (await prisma.calendarEvent.deleteMany({ where: byPrefix(prefix) })).count)
  }

  // 5. job_offers (now free of applications)
  for (const prefix of [seedIdPrefix.coachingOffer, seedIdPrefix.coachCandidate]) {
    log('job_offers', (await prisma.jobOffer.deleteMany({ where: byPrefix(prefix) })).count)
  }

  // 6. goals → users
  log('goals', (await prisma.goal.deleteMany({
    where: byPrefix(seedIdPrefix.coachCandidate),
  })).count)

  // 7. trainings — training_modules cascade on delete
  log('training_modules', (await prisma.trainingModule.deleteMany({
    where: { training: { id: { startsWith: seedIdPrefix.training } } },
  })).count)
  log('trainings', (await prisma.training.deleteMany({
    where: byPrefix(seedIdPrefix.training),
  })).count)

  // 8. resources (self-contained)
  log('resources', (await prisma.resource.deleteMany({
    where: byPrefix(seedIdPrefix.resource),
  })).count)

  // 9. seed users — Profile / CoachProfile / CoachAgreement cascade on user delete.
  //    Their non-cascading rows (applications, bookings, events, goals) were removed above.
  log('coach users', (await prisma.user.deleteMany({
    where: { email: { in: [...seedEmails.coaches] } },
  })).count)
  log('coach-candidate users', (await prisma.user.deleteMany({
    where: { email: { endsWith: seedEmails.coachCandidateDomain } },
  })).count)

  if (removeBaseUsers) {
    log('base login users', (await prisma.user.deleteMany({
      where: { email: { in: [...seedEmails.base] } },
    })).count)
  } else {
    console.log('  · base login users        kept (set REMOVE_BASE_USERS=yes to drop)')
  }

  console.log('\n✓ Seed teardown complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
