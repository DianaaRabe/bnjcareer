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
    durationDays: 35,
    instructor: 'Camille Rousseau',
    certificate: true,
  },
]

/** Programme per training, in reading order — the module count derives from these rows. */
const curriculum: Record<number, { title: string; summary?: string; durationMinutes?: number }[]> = {
  1: [
    { title: 'Auditer son profil actuel', summary: 'Repérer ce qui bloque les recruteurs.', durationMinutes: 45 },
    { title: 'Réécrire titre et résumé', summary: 'Se rendre trouvable sur les bons mots-clés.', durationMinutes: 60 },
    { title: 'Publier ses trois premiers posts', durationMinutes: 90 },
    { title: 'Engager la conversation', summary: 'Passer du like au message qualifié.', durationMinutes: 60 },
  ],
  2: [
    { title: 'Clarifier son point de départ', durationMinutes: 90 },
    { title: 'Choisir un métier cible réaliste', durationMinutes: 120 },
    { title: 'Tester avant de se lancer', summary: 'Valider la piste sans tout quitter.', durationMinutes: 120 },
    { title: 'Combler les écarts de compétences', durationMinutes: 180 },
    { title: 'Construire son offre', durationMinutes: 120 },
    { title: 'Trouver ses premiers clients', durationMinutes: 150 },
    { title: 'Gérer l\'administratif', durationMinutes: 90 },
  ],
  3: [
    { title: 'Faire le bilan de son parcours', durationMinutes: 90 },
    { title: 'Définir sa direction à trois ans', durationMinutes: 90 },
    { title: 'Cartographier son marché', durationMinutes: 120 },
    { title: 'Préparer ses entretiens', durationMinutes: 120 },
    { title: 'Activer son réseau', durationMinutes: 90 },
    { title: 'Négocier son évolution', durationMinutes: 90 },
  ],
  4: [
    { title: 'Extraire ses réalisations', durationMinutes: 45 },
    { title: 'Faire rédiger puis corriger par l\'IA', summary: 'Garder la main sur les faits.', durationMinutes: 60 },
    { title: 'Adapter son CV à chaque offre', durationMinutes: 45 },
  ],
  5: [
    { title: 'Décoder ce que teste le recruteur', durationMinutes: 60 },
    { title: 'Répondre aux questions pièges', durationMinutes: 90 },
    { title: 'Raconter ses échecs sans se desservir', durationMinutes: 60 },
    { title: 'Poser les bonnes questions', durationMinutes: 45 },
    { title: 'Négocier ses conditions', durationMinutes: 60 },
  ],
  6: [
    { title: 'Connaître sa valeur de marché', durationMinutes: 60 },
    { title: 'Choisir le bon moment', durationMinutes: 45 },
    { title: 'Mener l\'échange', durationMinutes: 90 },
    { title: 'Encaisser un refus et rebondir', durationMinutes: 45 },
  ],
  7: [
    { title: 'Ce qu\'est vraiment un programme', durationMinutes: 60 },
    { title: 'Variables et conditions', durationMinutes: 90 },
    { title: 'Boucles et fonctions', durationMinutes: 90 },
    { title: 'Données et API', durationMinutes: 90 },
    { title: 'Front, back, base de données', durationMinutes: 90 },
    { title: 'Git et travail en équipe', durationMinutes: 90 },
    { title: 'Lire un ticket technique', durationMinutes: 60 },
    { title: 'Dialoguer avec les développeurs', durationMinutes: 60 },
  ],
  8: [
    { title: 'Autorité et influence', durationMinutes: 60 },
    { title: 'Créer l\'adhésion sans lien hiérarchique', durationMinutes: 90 },
    { title: 'Arbitrer les priorités', durationMinutes: 90 },
    { title: 'Gérer les désaccords', durationMinutes: 90 },
    { title: 'Faire des retours utiles', durationMinutes: 60 },
    { title: 'Tenir dans la durée', durationMinutes: 60 },
  ],
}

async function main() {
  for (const [index, training] of trainings.entries()) {
    await prisma.training.upsert({
      where: { id: id(index + 1) },
      update: training,
      create: { id: id(index + 1), ...training },
    })
  }

  // Replace rather than merge: positions are unique, a stale row would collide.
  for (const [index] of trainings.entries()) {
    const trainingId = id(index + 1)
    await prisma.trainingModule.deleteMany({ where: { trainingId } })
    await prisma.trainingModule.createMany({
      data: (curriculum[index + 1] ?? []).map((module, position) => ({
        trainingId,
        title: module.title,
        summary: module.summary ?? null,
        position: position + 1,
        durationMinutes: module.durationMinutes ?? null,
      })),
    })
  }

  const moduleCount = Object.values(curriculum).reduce((total, list) => total + list.length, 0)
  console.log(`✓ ${trainings.length} trainings, ${moduleCount} modules seeded`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
