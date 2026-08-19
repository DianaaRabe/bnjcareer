import { PrismaClient, TrainingCategory, TrainingLevel } from '@prisma/client'

const prisma = new PrismaClient()

// Fixed ids keep the seed idempotent — re-running refreshes rows instead of duplicating them.
const id = (n: number) => `b0000000-0000-4000-8000-${String(n).padStart(12, '0')}`

const trainings = [
  {
    title: 'LinkedIn en 7 jours — décrocher son premier entretien',
    description: 'Refondre son profil et obtenir un premier contact qualifié en une semaine.',
    category: TrainingCategory.SOFT_SKILLS,
    level: TrainingLevel.BEGINNER,
    priceCents: null,
    modules: 4,
    durationDays: 7,
    instructor: 'Camille Rousseau',
    certificate: true,
  },
  {
    title: 'Réussir sa reconversion sans se tromper',
    description: 'Positionnement, offre, acquisition : le chemin complet vers un nouveau métier.',
    category: TrainingCategory.CAREER_CHANGE,
    level: TrainingLevel.ADVANCED,
    priceCents: 9900,
    modules: 7,
    durationDays: 56,
    instructor: 'Karim Benali',
    certificate: true,
  },
  {
    title: 'Stratégie de carrière 360°',
    description: 'Clarifier sa direction et accélérer son évolution professionnelle.',
    category: TrainingCategory.INTERVIEW,
    level: TrainingLevel.INTERMEDIATE,
    priceCents: 6900,
    modules: 6,
    durationDays: 42,
    instructor: 'Camille Rousseau',
    certificate: true,
  },
  {
    title: "Optimiser son CV avec l'IA",
    description: "Utiliser l'IA pour transformer son CV en argumentaire percutant.",
    category: TrainingCategory.CV,
    level: TrainingLevel.BEGINNER,
    priceCents: null,
    modules: 3,
    durationDays: 3,
    instructor: 'Léa Fontaine',
    certificate: false,
  },
  {
    title: "Techniques d'entretien avancées",
    description: 'Répondre aux questions pièges et négocier ses conditions en confiance.',
    category: TrainingCategory.INTERVIEW,
    level: TrainingLevel.INTERMEDIATE,
    priceCents: null,
    modules: 5,
    durationDays: 14,
    instructor: 'Karim Benali',
    certificate: true,
  },
  {
    title: 'Négociation salariale sans stress',
    description: 'Préparer et mener une négociation salariale sereinement.',
    category: TrainingCategory.SOFT_SKILLS,
    level: TrainingLevel.ADVANCED,
    priceCents: 7900,
    modules: 4,
    durationDays: 10,
    instructor: 'Léa Fontaine',
    certificate: false,
  },
  {
    title: 'Bases du code pour non-tech',
    description: 'Comprendre les fondamentaux pour mieux dialoguer avec les équipes tech.',
    category: TrainingCategory.TECHNICAL,
    level: TrainingLevel.BEGINNER,
    priceCents: 4900,
    modules: 8,
    durationDays: 28,
    instructor: 'Karim Benali',
    certificate: true,
  },
  {
    title: 'Manager sans autorité hiérarchique',
    description: 'Fédérer et faire avancer une équipe transverse sans lien hiérarchique.',
    category: TrainingCategory.LEADERSHIP,
    level: TrainingLevel.ADVANCED,
    priceCents: 8900,
    modules: 6,
    durationDays: 35,
    instructor: 'Camille Rousseau',
    certificate: true,
  },
]

async function main() {
  for (const [index, training] of trainings.entries()) {
    await prisma.training.upsert({
      where: { id: id(index + 1) },
      update: training,
      create: { id: id(index + 1), ...training },
    })
  }

  console.log(`✓ ${trainings.length} trainings seeded`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
