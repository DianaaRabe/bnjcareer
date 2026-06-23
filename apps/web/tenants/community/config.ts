import type { TenantConfig } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// BNJ Community tenant
//
// Identity: réseau professionnel privé, premium, chaleureux, communautaire.
// Inspired by: LinkedIn Premium × alumni network × cabinet de recrutement haut de gamme.
//
// Palette (from ChatGPT recommendations):
//   #0F172A — slate très foncé  (dark backgrounds, text)
//   #1E3A8A — bleu profond      (primary — professional, trustworthy)
//   #93C5FD — bleu clair        (light — highlights, active states)
//   #D4AF37 — or classique      (accent — premium, warm, Jewish heritage)
//   #F8FAFC — blanc cassé       (bg — very clean, airy, spacious)
//   #EAD7B7 — sable/beige chaud (subtle — warmth, intimacy)
//
// Typography: DM Serif Display for h1/h2 — editorial, élégant, pas "tech startup"
// ─────────────────────────────────────────────────────────────────────────────

const config: TenantConfig = {
  id: 'community',
  locale: 'fr',
  dir: 'ltr',

  branding: {
    name: 'BNJ Community',
    tagline: 'Réseau · Excellence · Transmission',
    colors: {
      primary: '30 58 138',    // #1E3A8A — bleu profond, corporate, sérieux
      dark:    '15 23 42',     // #0F172A — slate très foncé (sidebar, header)
      light:   '147 197 253',  // #93C5FD — bleu-300, pour icônes actives, textes sur fond sombre
      accent:  '212 175 55',   // #D4AF37 — or classique, chaleureux, premium
      bg:      '248 250 252',  // #F8FAFC — blanc aéré, beaucoup d'espace
      subtle:  '234 215 183',  // #EAD7B7 — sable/beige, chaleur, intimité
    },
    // Pas de logo image — le Sidebar affichera un text mark élégant
    logo: '',
    favicon: '/logo.png',
    // DM Serif Display : font éditoriale, premium, pas "startup tech"
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap',
    displayFont: "'DM Serif Display', Georgia, 'Times New Roman', serif",
  },

  seo: {
    title: 'BNJ Community — Votre Réseau Professionnel d\'Excellence',
    description: 'La plateforme d\'emploi et de coaching de la communauté. Offres exclusives, formations et accompagnement personnalisé par des experts dédiés.',
    ogImage: '/og-community.png',
    canonicalBase: 'https://community.bnjcareer.com',
    keywords: ['emploi communauté', 'offres emploi', 'coaching', 'formations', 'réseau professionnel', 'excellence'],
  },

  features: {
    jobAggregators: false,
    localJobs: true,
    aggregatorSources: [],
    formations: true,
    coaching: true,
    cvOptimizer: true,
    candiboost: true,
    resources: true,
    messaging: true,
    adminDashboard: true,
  },

  jobs: {
    provider: 'local-db',
    defaultLocation: 'France',
    defaultKeywords: '',
  },

  hero: {
    headline: 'Des opportunités taillées pour votre excellence',
    subheadline: 'Accédez aux meilleures offres d\'entreprises partenaires, bénéficiez d\'un coaching d\'élite et rejoignez un réseau professionnel d\'exception.',
    ctaLabel: 'Rejoindre la communauté',
    ctaHref: '/login',
  },
}

export default config
