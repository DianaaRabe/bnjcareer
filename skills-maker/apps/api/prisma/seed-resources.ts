import { PrismaClient, ResourceAccess, ResourceCategory, ResourceType } from '@prisma/client'

const prisma = new PrismaClient()

// Fixed ids keep the seed idempotent — re-running refreshes rows instead of duplicating them.
const id = (n: number) => `d0000000-0000-4000-8000-${String(n).padStart(12, '0')}`

const KO = 1024
const MO = 1024 * 1024

const resources = [
  {
    title: "Liste des meilleures plateformes d'emploi 2025",
    description: 'Comparatif des 20 meilleures plateformes de recrutement : généralistes, sectorielles, réseaux sociaux, cabinets.',
    type: ResourceType.PDF,
    category: ResourceCategory.TOOLS,
    sizeBytes: Math.round(680 * KO),
    access: ResourceAccess.FREE,
  },
  {
    title: 'Générateur de mots-clés ATS pour CV',
    description: "Article expliquant les systèmes ATS et comment optimiser son CV pour passer les filtres automatiques.",
    type: ResourceType.ARTICLE,
    category: ResourceCategory.TOOLS,
    access: ResourceAccess.FREE,
  },
  {
    title: 'Masterclass : Reconversion professionnelle réussie',
    description: "Tout ce qu'il faut savoir pour réussir sa reconversion : bilan de compétences, formation, financement CPF, stratégie.",
    type: ResourceType.REPLAY,
    category: ResourceCategory.COACHING,
    durationMinutes: 88,
    access: ResourceAccess.PAID,
    priceCents: 3900,
  },
  {
    title: 'Méthode BNJ — Trouver un emploi en 90 jours',
    description: 'La méthode exclusive BNJ Team Maker : roadmap complète, outils et mindset pour décrocher un CDI en moins de 3 mois.',
    type: ResourceType.PDF,
    category: ResourceCategory.COACHING,
    sizeBytes: Math.round(5.8 * MO),
    access: ResourceAccess.PREMIUM,
  },
  {
    title: "Gérer sa santé mentale pendant la recherche d'emploi",
    description: 'Article sur les routines, la gestion du rejet et les techniques pour rester motivé sur la durée.',
    type: ResourceType.ARTICLE,
    category: ResourceCategory.ORGANIZATION,
    access: ResourceAccess.FREE,
  },
  {
    title: "Planner hebdomadaire de recherche d'emploi",
    description: 'Template pour organiser sa semaine : candidatures, relances, networking, veille. Inclus des objectifs SMART.',
    type: ResourceType.DOC,
    category: ResourceCategory.ORGANIZATION,
    sizeBytes: Math.round(280 * KO),
    access: ResourceAccess.FREE,
  },
  {
    title: 'Programme Personal Branding Premium — 30 jours',
    description: "Plan d'action personnalisé sur 30 jours pour construire une présence digitale professionnelle et générer des opportunités.",
    type: ResourceType.PDF,
    category: ResourceCategory.NETWORK,
    sizeBytes: Math.round(3.2 * MO),
    access: ResourceAccess.PAID,
    priceCents: 4900,
  },
  {
    title: 'Guide du networking efficace',
    description: 'Comment approcher des inconnus, rédiger un message LinkedIn percutant, et transformer vos contacts en opportunités.',
    type: ResourceType.PDF,
    category: ResourceCategory.NETWORK,
    sizeBytes: Math.round(1.4 * MO),
    access: ResourceAccess.FREE,
  },
  {
    title: 'Guide : Maîtriser la méthode STAR',
    description: 'La méthode STAR expliquée avec 20 exemples concrets pour répondre à toutes les questions comportementales.',
    type: ResourceType.PDF,
    category: ResourceCategory.INTERVIEW,
    sizeBytes: Math.round(900 * KO),
    access: ResourceAccess.FREE,
  },
  {
    title: 'Atelier : Négocier son salaire — Replay',
    description: 'Techniques de négociation salariale, argumentation, gestion des objections et simulation complète.',
    type: ResourceType.REPLAY,
    category: ResourceCategory.INTERVIEW,
    durationMinutes: 72,
    access: ResourceAccess.PAID,
    priceCents: 1900,
  },
  {
    title: 'Atelier : Préparer ses entretiens — Replay',
    description: "Replay de l'atelier collectif : exercices pratiques, jeux de rôles et retours personnalisés.",
    type: ResourceType.REPLAY,
    category: ResourceCategory.INTERVIEW,
    durationMinutes: 58,
    access: ResourceAccess.FREE,
  },
  {
    title: 'Réussir son entretien — Masterclass complète',
    description: 'De la préparation mentale au suivi post-entretien. Techniques de storytelling, questions pièges, négociation.',
    type: ResourceType.VIDEO,
    category: ResourceCategory.INTERVIEW,
    durationMinutes: 42,
    access: ResourceAccess.FREE,
  },
  {
    title: "Les 50 questions d'entretien les plus posées",
    description: 'Questions RH et techniques avec exemples de réponses structurées selon la méthode STAR.',
    type: ResourceType.PDF,
    category: ResourceCategory.INTERVIEW,
    sizeBytes: Math.round(1.1 * MO),
    access: ResourceAccess.FREE,
  },
  {
    title: 'Pack Premium Candidature — CV + Lettre + Tracker',
    description: 'Le pack complet avec CV optimisé ATS, templates de lettres personnalisés par secteur et tableau de bord candidature avancé.',
    type: ResourceType.DOC,
    category: ResourceCategory.APPLICATION,
    sizeBytes: Math.round(8.5 * MO),
    access: ResourceAccess.PAID,
    priceCents: 2900,
  },
  {
    title: 'Template de suivi des candidatures',
    description: 'Tableau Excel pour tracker chaque candidature : entreprise, poste, statut, relances.',
    type: ResourceType.DOC,
    category: ResourceCategory.APPLICATION,
    sizeBytes: Math.round(420 * KO),
    access: ResourceAccess.FREE,
  },
  {
    title: 'Modèles de lettres de motivation (pack complet)',
    description: '15 templates personnalisables pour tous secteurs : CDI, alternance, stage, reconversion.',
    type: ResourceType.DOC,
    category: ResourceCategory.APPLICATION,
    sizeBytes: Math.round(1.8 * MO),
    access: ResourceAccess.FREE,
  },
]

async function main() {
  for (const [index, resource] of resources.entries()) {
    // Placeholder file, so a free resource has something to open in the demo.
    const url = resource.access === ResourceAccess.FREE ? `https://cdn.bnj.dev/resources/${id(index + 1)}` : null
    const data = { ...resource, url, published: true }

    await prisma.resource.upsert({
      where: { id: id(index + 1) },
      update: data,
      create: { id: id(index + 1), ...data },
    })
  }

  console.log(`✓ ${resources.length} resources seeded`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
