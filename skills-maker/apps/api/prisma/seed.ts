import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Test users — shared password: "password123"
const users = [
  { email: 'candidat@test.dev', role: Role.CANDIDATE, firstName: 'Camille', lastName: 'Candidat' },
  { email: 'coach@test.dev', role: Role.COACH, firstName: 'Chris', lastName: 'Coach' },
  { email: 'admin@test.dev', role: Role.ADMIN, firstName: 'Alex', lastName: 'Admin' },
]

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash,
        role: u.role,
        profile: { create: { firstName: u.firstName, lastName: u.lastName } },
      },
    })
    console.log(`✓ ${u.role.padEnd(9)} ${u.email}`)
  }

  console.log('\nSeed complete. Shared password: password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
