import type { TenantConfig } from '../types'

const config: TenantConfig = {
  id: 'africa',
  locale: 'fr',
  dir: 'ltr',

  branding: {
    name: 'BNJ Africa Careers',
    tagline: 'Ton Avenir Commence Ici',
    colors: {
      primary: '89 2 147',    // #590293 — same brand family
      dark:    '62 8 99',     // #3E0863
      light:   '192 105 238', // #C069EE
      accent:  '245 166 35',  // #F5A623 — warm African gold
      bg:      '245 243 239', // #F5F3EF — slightly warmer cream
      subtle:  '238 221 245', // #EEDDF5
    },
    logo: '/logo-africa.png',
    favicon: '/logo-africa.png',
  },

  seo: {
    title: 'BNJ Africa Careers — Ton Avenir Commence Ici',
    description: 'La plateforme de carrière africaine pour trouver un emploi, optimiser son CV et accéder au coaching professionnel.',
    ogImage: '/og-africa.png',
    canonicalBase: 'https://africa.bnjcareer.com',
    keywords: ['emploi afrique', 'offres emploi', 'CV', 'coaching carrière', 'formation', 'Sénégal', 'Côte d\'Ivoire', 'Maroc', 'Cameroun'],
  },

  features: {
    jobAggregators: true,
    localJobs: false,
    aggregatorSources: ['indeed', 'linkedin', 'cabinet', 'immigration'],  // HelloWork is FR-specific
    formations: true,
    coaching: true,
    cvOptimizer: true,
    candiboost: true,
    resources: true,
    messaging: true,
    adminDashboard: false,
  },

  jobs: {
    provider: 'aggregator',
    defaultLocation: 'Afrique',
    defaultKeywords: 'Développeur',
  },

  hero: {
    headline: 'Construis la carrière que tu mérites',
    subheadline: 'CV optimisé, préparation aux entretiens et accès aux meilleures opportunités professionnelles sur le continent africain.',
    ctaLabel: 'Rejoindre la plateforme',
    ctaHref: '/login',
  },
}

export default config
