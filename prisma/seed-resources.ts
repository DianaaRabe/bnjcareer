/**
 * Seed: resources
 *
 * Prérequis :
 *   1. seed-benjamin-fanilo.ts doit avoir été exécuté (Benjamin doit exister).
 *   2. La migration prisma/migrations/20260511_resources_extended.sql doit être
 *      appliquée dans Supabase (SQL Editor).
 *
 * Commande : npm run seed:resources
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL     = 'https://ogwrtegpknihxixgptqe.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd3J0ZWdwa25paHhpeGdwdHFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc0MzE0NiwiZXhwIjoyMDkxMzE5MTQ2fQ.Qe52dmgdVa_XXip5xC7NxSqFnAwgWTJzZNvs6CB8EaY'

const BENJAMIN_EMAIL = 'site.benjaminparienty@gmail.com'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const log  = (msg: string) => console.log(`  ✅ ${msg}`)
const warn = (msg: string) => console.warn(`  ⚠️  ${msg}`)
const info = (msg: string) => console.log(`\n📦 ${msg}`)

async function getUserIdByEmail(email: string): Promise<string | null> {
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  return users.find((u) => u.email === email)?.id ?? null
}

interface ResourceSeed {
  title: string
  description: string
  type: 'pdf' | 'video' | 'replay' | 'article' | 'doc'
  category: string
  file_url: string
  size_label?: string
  duration_label?: string
  is_published: boolean
  is_locked: boolean
  price: number
  views_count: number
}

async function main() {
  console.log('\n🌱 Seed — Ressources BNJ Career\n')

  // ── Récupérer Benjamin (le coach) ──────────────────────────────────────────
  info('Récupération du coach Benjamin')
  const benjaminId = await getUserIdByEmail(BENJAMIN_EMAIL)
  if (!benjaminId) {
    console.error('❌ Benjamin introuvable. Lance d\'abord npm run seed:bnj')
    process.exit(1)
  }
  log(`Benjamin trouvé : ${benjaminId.slice(0, 8)}...`)

  // ── Supprimer les ressources existantes du coach pour éviter les doublons ─
  info('Nettoyage des ressources existantes')
  const { error: delError } = await supabase
    .from('resources')
    .delete()
    .eq('coach_id', benjaminId)
  if (delError) warn(`Impossible de supprimer : ${delError.message}`)
  else log('Anciennes ressources supprimées')

  // ── Ressources à insérer ───────────────────────────────────────────────────
  const resources: ResourceSeed[] = [
    // ── CANDIDATURE ──
    {
      title:       'Guide complet de la recherche d\'emploi 2025',
      description: 'Toutes les étapes pour structurer sa recherche d\'emploi : CV, LinkedIn, candidatures spontanées, suivi des offres.',
      type:        'pdf',
      category:    'Candidature',
      file_url:    'https://drive.google.com/file/d/example-cv-guide/view',
      size_label:  '3.2 Mo',
      is_published: true,
      is_locked:   false,
      price:       0,
      views_count: 214,
    },
    {
      title:       'Modèles de lettres de motivation (pack complet)',
      description: '15 templates personnalisables pour tous secteurs : CDI, alternance, stage, reconversion.',
      type:        'doc',
      category:    'Candidature',
      file_url:    'https://drive.google.com/file/d/example-lettres/view',
      size_label:  '1.8 Mo',
      is_published: true,
      is_locked:   false,
      price:       0,
      views_count: 312,
    },
    {
      title:       'Template de suivi des candidatures',
      description: 'Tableau Excel pour tracker chaque candidature : entreprise, poste, statut, relances.',
      type:        'doc',
      category:    'Candidature',
      file_url:    'https://docs.google.com/spreadsheets/d/example-tracker/edit',
      size_label:  '420 Ko',
      is_published: true,
      is_locked:   false,
      price:       0,
      views_count: 189,
    },
    {
      title:       'Pack Premium Candidature — CV + Lettre + Tracker',
      description: 'Le pack complet avec CV optimisé ATS, templates de lettres personnalisés par secteur et tableau de bord candidature avancé.',
      type:        'doc',
      category:    'Candidature',
      file_url:    'https://drive.google.com/file/d/example-pack-premium/view',
      size_label:  '8.5 Mo',
      is_published: true,
      is_locked:   true,
      price:       29,
      views_count: 87,
    },

    // ── ENTRETIEN ──
    {
      title:       'Les 50 questions d\'entretien les plus posées',
      description: 'Questions RH et techniques avec exemples de réponses structurées selon la méthode STAR.',
      type:        'pdf',
      category:    'Entretien',
      file_url:    'https://drive.google.com/file/d/example-questions/view',
      size_label:  '1.1 Mo',
      is_published: true,
      is_locked:   false,
      price:       0,
      views_count: 445,
    },
    {
      title:       'Réussir son entretien — Masterclass complète',
      description: 'De la préparation mentale au suivi post-entretien. Techniques de storytelling, questions pièges, négociation.',
      type:        'video',
      category:    'Entretien',
      file_url:    'https://www.youtube.com/watch?v=example-masterclass',
      duration_label: '42 min',
      is_published: true,
      is_locked:   false,
      price:       0,
      views_count: 328,
    },
    {
      title:       'Atelier : Préparer ses entretiens — Replay',
      description: 'Replay de l\'atelier collectif du 15 mars 2025. Exercices pratiques, jeux de rôles et retours personnalisés.',
      type:        'replay',
      category:    'Entretien',
      file_url:    'https://drive.google.com/file/d/example-replay-entretien/view',
      duration_label: '58 min',
      is_published: true,
      is_locked:   false,
      price:       0,
      views_count: 156,
    },
    {
      title:       'Atelier : Négocier son salaire — Replay',
      description: 'Techniques de négociation salariale, argumentation, gestion des objections et simulation complète.',
      type:        'replay',
      category:    'Entretien',
      file_url:    'https://drive.google.com/file/d/example-replay-salaire/view',
      duration_label: '1h 12min',
      is_published: true,
      is_locked:   true,
      price:       19,
      views_count: 203,
    },
    {
      title:       'Guide : Maîtriser la méthode STAR',
      description: 'La méthode STAR expliquée avec 20 exemples concrets pour répondre à toutes les questions comportementales.',
      type:        'pdf',
      category:    'Entretien',
      file_url:    'https://drive.google.com/file/d/example-star/view',
      size_label:  '900 Ko',
      is_published: true,
      is_locked:   false,
      price:       0,
      views_count: 278,
    },

    // ── RÉSEAU ──
    {
      title:       'Comment optimiser son profil LinkedIn',
      description: 'Checklist complète : photo, accroche, expériences, compétences, recommandations. Passer de 0 à 100% de profil.',
      type:        'video',
      category:    'Réseau',
      file_url:    'https://www.youtube.com/watch?v=example-linkedin',
      duration_label: '18 min',
      is_published: true,
      is_locked:   false,
      price:       0,
      views_count: 521,
    },
    {
      title:       'Construire son personal branding',
      description: 'Définir son positionnement, construire sa visibilité en ligne et créer du contenu qui attire les recruteurs.',
      type:        'video',
      category:    'Réseau',
      file_url:    'https://www.youtube.com/watch?v=example-branding',
      duration_label: '24 min',
      is_published: true,
      is_locked:   false,
      price:       0,
      views_count: 367,
    },
    {
      title:       'Guide du networking efficace',
      description: 'Comment approcher des inconnus, rédiger un message LinkedIn percutant, et transformer vos contacts en opportunités.',
      type:        'pdf',
      category:    'Réseau',
      file_url:    'https://drive.google.com/file/d/example-networking/view',
      size_label:  '1.4 Mo',
      is_published: true,
      is_locked:   false,
      price:       0,
      views_count: 241,
    },
    {
      title:       'Programme Personal Branding Premium — 30 jours',
      description: 'Plan d\'action personnalisé sur 30 jours pour construire une présence digitale professionnelle et générer des opportunités.',
      type:        'pdf',
      category:    'Réseau',
      file_url:    'https://drive.google.com/file/d/example-branding-premium/view',
      size_label:  '4.2 Mo',
      is_published: true,
      is_locked:   true,
      price:       49,
      views_count: 134,
    },

    // ── ORGANISATION ──
    {
      title:       'Planner hebdomadaire de recherche d\'emploi',
      description: 'Template pour organiser sa semaine : candidatures, relances, networking, veille. Inclus des objectifs SMART.',
      type:        'doc',
      category:    'Organisation',
      file_url:    'https://docs.google.com/spreadsheets/d/example-planner/edit',
      size_label:  '280 Ko',
      is_published: true,
      is_locked:   false,
      price:       0,
      views_count: 173,
    },
    {
      title:       'Gérer sa santé mentale pendant la recherche d\'emploi',
      description: 'Article sur les routines, la gestion du rejet et les techniques pour rester motivé sur la durée.',
      type:        'article',
      category:    'Organisation',
      file_url:    'https://bnj.career/blog/sante-mentale-recherche-emploi',
      is_published: true,
      is_locked:   false,
      price:       0,
      views_count: 298,
    },

    // ── COACHING ──
    {
      title:       'Méthode BNJ — Trouver un emploi en 90 jours',
      description: 'La méthode exclusive BNJ Team Maker : roadmap complète, outils et mindset pour décrocher un CDI en moins de 3 mois.',
      type:        'pdf',
      category:    'Coaching',
      file_url:    'https://drive.google.com/file/d/example-methode-bnj/view',
      size_label:  '5.8 Mo',
      is_published: true,
      is_locked:   true,
      price:       0,
      views_count: 412,
    },
    {
      title:       'Masterclass : Reconversion professionnelle réussie',
      description: 'Tout ce qu\'il faut savoir pour réussir sa reconversion : bilan de compétences, formation, financement CPF, stratégie.',
      type:        'replay',
      category:    'Coaching',
      file_url:    'https://drive.google.com/file/d/example-reconversion/view',
      duration_label: '1h 28min',
      is_published: true,
      is_locked:   true,
      price:       39,
      views_count: 167,
    },

    // ── OUTILS ──
    {
      title:       'Générateur de mots-clés ATS pour CV',
      description: 'Article expliquant les systèmes ATS et comment optimiser son CV pour passer les filtres automatiques.',
      type:        'article',
      category:    'Outils',
      file_url:    'https://bnj.career/blog/optimiser-cv-ats',
      is_published: true,
      is_locked:   false,
      price:       0,
      views_count: 389,
    },
    {
      title:       'Liste des meilleures plateformes d\'emploi 2025',
      description: 'Comparatif des 20 meilleures plateformes de recrutement : généralistes, sectorielles, réseaux sociaux, cabinets.',
      type:        'pdf',
      category:    'Outils',
      file_url:    'https://drive.google.com/file/d/example-plateformes/view',
      size_label:  '680 Ko',
      is_published: true,
      is_locked:   false,
      price:       0,
      views_count: 256,
    },
  ]

  // ── Insérer ────────────────────────────────────────────────────────────────
  info(`Insertion de ${resources.length} ressources`)

  let inserted = 0
  for (const res of resources) {
    const { error } = await supabase
      .from('resources')
      .insert({
        ...res,
        url:       res.file_url,  // keep legacy column in sync
        coach_id:  benjaminId,
      })

    if (error) {
      warn(`Erreur sur "${res.title}" : ${error.message}`)
    } else {
      log(`${res.title} (${res.category} · ${res.type}${res.is_locked ? ' · 🔒 ' + (res.price > 0 ? res.price + '€' : 'Premium') : ''})`)
      inserted++
    }
  }

  console.log(`\n✨ Done ! ${inserted}/${resources.length} ressources insérées.\n`)
}

main().catch((err) => {
  console.error('❌ Erreur fatale :', err)
  process.exit(1)
})
