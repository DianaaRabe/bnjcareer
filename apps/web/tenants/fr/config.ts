import type { TenantConfig } from '../types'

const config: TenantConfig = {
  id: 'fr',
  locale: 'fr',
  dir: 'ltr',

  branding: {
    name: 'BNJ Skills Maker',
    tagline: 'Chasseur d\'Opportunités',
    colors: {
      primary: '89 2 147',    // #590293
      dark:    '62 8 99',     // #3E0863
      light:   '192 105 238', // #C069EE
      accent:  '243 208 31',  // #F3D01F
      bg:      '243 242 241', // #F3F2F1
      subtle:  '238 221 245', // #EEDDF5
    },
    // White logo on transparent — served from Webflow CDN (no background artefact)
    logo: 'https://cdn.prod.website-files.com/68f74eda1b97775fa6dd76a2/691752fe9142ffa21169191b_Logo_white.png',
    favicon: '/logo.png',
  },

  seo: {
    title: 'BNJ Skills Maker — Chasseur d\'Opportunités',
    description: 'La plateforme qui aide les candidats français à décrocher l\'emploi de leurs rêves. CV, entretiens, formations et coaching.',
    ogImage: '/og-fr.png',
    canonicalBase: 'https://fr.bnjcareer.com',
    keywords: ['emploi france', 'recherche emploi', 'CV', 'entretien', 'coaching carrière', 'formation professionnelle'],
  },

  features: {
    jobAggregators: true,
    localJobs: false,
    aggregatorSources: ['indeed', 'linkedin', 'hellowork', 'cabinet', 'immigration'],
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
    defaultLocation: 'France',
    defaultKeywords: 'Développeur',
  },

  hero: {
    headline: 'Décroche l\'emploi que tu mérites',
    subheadline: 'CV optimisé ATS, préparation entretiens, coaching personnalisé et accès aux meilleures offres d\'emploi françaises.',
    ctaLabel: 'Commencer gratuitement',
    ctaHref: '/login',
  },
}

export default config
