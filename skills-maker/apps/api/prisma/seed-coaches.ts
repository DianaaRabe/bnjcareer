import { CoachExpertise, PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Fixed ids keep the seed idempotent — re-running refreshes rows instead of duplicating them.
const id = (n: number) => `c0000000-0000-4000-8000-${String(n).padStart(12, '0')}`

const coaches = [
  {
    email: 'thomas.dubois@bnj.dev',
    firstName: 'Thomas',
    lastName: 'Dubois',
    bio: "Ancien DRH Grand Groupe (15 ans) reconverti en coach professionnel. Expert en leadership, négociation salariale et stratégie de carrière pour dirigeants.",
    specialty: 'Leadership & Négociation',
    yearsExperience: 12,
    certifications: ['Coach Professionnel RNCP', 'Assesseur DISC', 'Praticien MBTI'],
    expertise: [CoachExpertise.LEADERSHIP, CoachExpertise.NEGOTIATION, CoachExpertise.INTERVIEW],
    rating: 4.9,
    acceptingClients: true,
  },
  {
    email: 'harena.rabenandrasana@bnj.dev',
    firstName: 'Harena',
    lastName: 'Rabenandrasana',
    bio: "Coach certifiée et experte en transition professionnelle, j'accompagne les candidats vers la réussite de leur projet d'emploi grâce à des stratégies de positionnement sur-mesure et un coaching axé sur la performance.",
    specialty: 'Coaching RH & Recrutement',
    yearsExperience: 2,
    certifications: ['Coach Certifiée RNCP'],
    expertise: [CoachExpertise.CAREER_CHANGE, CoachExpertise.INTERVIEW, CoachExpertise.CV_STRATEGY],
    rating: 4.9,
    acceptingClients: true,
  },
  {
    email: 'benjamin.parienty@bnj.dev',
    firstName: 'Benjamin',
    lastName: 'Parienty',
    bio: "Fondateur de BNJ Skills Maker. Coach certifié en stratégie de carrière, entrepreneuriat et personal branding. J'ai accompagné plus de 800 candidats vers leur prochain poste.",
    specialty: 'Stratégie de carrière & Entrepreneuriat',
    yearsExperience: 7,
    certifications: ['Coach Professionnel ICF', 'Expert Bilan de Compétences', 'Formateur certifié'],
    expertise: [CoachExpertise.CAREER_CHANGE, CoachExpertise.LINKEDIN, CoachExpertise.LEADERSHIP],
    rating: 4.9,
    acceptingClients: true,
  },
  {
    email: 'camille.lerouge@bnj.dev',
    firstName: 'Camille',
    lastName: 'Le Rouge',
    bio: "Consultante RH et formatrice depuis 10 ans. Spécialisée dans l'accompagnement des jeunes diplômés et la préparation aux concours et entretiens d'embauche.",
    specialty: 'Insertion & Jeunes diplômés',
    yearsExperience: 10,
    certifications: ['Consultante RH certifiée', 'Formatrice AFEST'],
    expertise: [CoachExpertise.CV_STRATEGY, CoachExpertise.INTERVIEW, CoachExpertise.LINKEDIN],
    rating: 4.9,
    acceptingClients: true,
  },
]

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)

  for (const [index, coach] of coaches.entries()) {
    const { email, firstName, lastName, bio, ...coachData } = coach
    const profile = { firstName, lastName, bio }

    const user = await prisma.user.upsert({
      where: { email },
      update: { profile: { update: profile } },
      create: {
        id: id(index + 1),
        email,
        passwordHash,
        role: Role.COACH,
        profile: { create: profile },
      },
    })

    await prisma.coachProfile.upsert({
      where: { userId: user.id },
      update: coachData,
      create: { userId: user.id, ...coachData },
    })
  }

  console.log(`✓ ${coaches.length} coaches seeded — shared password: password123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
