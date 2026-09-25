// ─────────────────────────────────────────────────────────────────────────────
// International — curated developer offers abroad (Canada for now).
// A static, always-available source so the "International" tab always shows
// relevant openings for developers, independent of any external API/quota.
// Keywords/location narrow the list client-side; no upstream call is made.
// ─────────────────────────────────────────────────────────────────────────────

import {
  JOB_SOURCE,
  SALARY_PERIOD,
  type JobProvider,
  type JobSearchOutcome,
  type JobSearchQuery,
  type NormalizedJob,
} from './types.js'

type CuratedOffer = Omit<NormalizedJob, 'id' | 'source'>

// Curated Canada developer openings. Salaries are in CAD/year, expressed as
// structured values so the UI can render them consistently.
const CANADA_DEVELOPER_OFFERS: CuratedOffer[] = [
  {
    title: 'Développeur Full-Stack (React / Node.js)',
    company: 'Shopify',
    location: 'Montréal, QC, Canada',
    description:
      "Rejoignez une équipe produit pour construire des expériences marchandes à grande échelle. " +
      "Stack React, TypeScript, Node.js et GraphQL. Environnement bilingue, télétravail flexible.",
    applyUrl: 'https://www.shopify.com/careers',
    postedAt: null,
    salary: { label: '95 000 – 130 000 CAD / an', min: 95000, max: 130000, currency: 'CAD', period: SALARY_PERIOD.year },
    tags: ['CDI', 'React', 'Node.js', 'TypeScript', 'Télétravail'],
    isRemote: true,
  },
  {
    title: 'Software Developer — Backend (Go)',
    company: 'Wealthsimple',
    location: 'Toronto, ON, Canada',
    description:
      "Concevez des services financiers robustes et sécurisés en Go et PostgreSQL. " +
      "Vous participerez à la conception d'API et à la fiabilité de plateformes à fort trafic.",
    applyUrl: 'https://www.wealthsimple.com/careers',
    postedAt: null,
    salary: { label: '100 000 – 140 000 CAD / an', min: 100000, max: 140000, currency: 'CAD', period: SALARY_PERIOD.year },
    tags: ['CDI', 'Go', 'PostgreSQL', 'Backend'],
    isRemote: false,
  },
  {
    title: 'Développeur Frontend (Vue.js)',
    company: 'Lightspeed Commerce',
    location: 'Montréal, QC, Canada',
    description:
      "Construisez des interfaces performantes pour des commerçants du monde entier. " +
      "Vue.js, TypeScript, tests end-to-end. Culture d'ingénierie forte et mentorat.",
    applyUrl: 'https://www.lightspeedhq.com/careers/',
    postedAt: null,
    salary: { label: '85 000 – 115 000 CAD / an', min: 85000, max: 115000, currency: 'CAD', period: SALARY_PERIOD.year },
    tags: ['CDI', 'Vue.js', 'TypeScript', 'Frontend'],
    isRemote: false,
  },
  {
    title: 'Ingénieur Logiciel Junior',
    company: 'Coveo',
    location: 'Québec, QC, Canada',
    description:
      "Idéal pour un profil débutant : accompagnement, revues de code et montée en compétences " +
      "sur une plateforme d'IA de recherche. Java, cloud AWS, microservices.",
    applyUrl: 'https://www.coveo.com/en/company/careers',
    postedAt: null,
    salary: { label: '70 000 – 90 000 CAD / an', min: 70000, max: 90000, currency: 'CAD', period: SALARY_PERIOD.year },
    tags: ['CDI', 'Junior', 'Java', 'AWS'],
    isRemote: false,
  },
  {
    title: 'Full-Stack Engineer (Remote Canada)',
    company: 'GitLab',
    location: 'Télétravail — Canada',
    description:
      "Poste 100% télétravail au sein d'une entreprise all-remote. Ruby on Rails et Vue.js. " +
      "Autonomie, documentation écrite et collaboration asynchrone.",
    applyUrl: 'https://about.gitlab.com/jobs/',
    postedAt: null,
    salary: { label: '105 000 – 150 000 CAD / an', min: 105000, max: 150000, currency: 'CAD', period: SALARY_PERIOD.year },
    tags: ['CDI', 'Remote', 'Ruby on Rails', 'Vue.js'],
    isRemote: true,
  },
  {
    title: 'Développeur Mobile (React Native)',
    company: 'Hopper',
    location: 'Montréal, QC, Canada',
    description:
      "Développez une application de voyage utilisée par des millions de personnes. " +
      "React Native, TypeScript, intégrations natives iOS/Android.",
    applyUrl: 'https://www.hopper.com/careers',
    postedAt: null,
    salary: { label: '90 000 – 125 000 CAD / an', min: 90000, max: 125000, currency: 'CAD', period: SALARY_PERIOD.year },
    tags: ['CDI', 'React Native', 'Mobile', 'TypeScript'],
    isRemote: false,
  },
  {
    title: 'DevOps / Cloud Engineer',
    company: 'Benevity',
    location: 'Calgary, AB, Canada',
    description:
      "Automatisez le déploiement et l'observabilité de plateformes cloud. " +
      "Kubernetes, Terraform, AWS, CI/CD. Mission à impact social.",
    applyUrl: 'https://benevity.com/careers',
    postedAt: null,
    salary: { label: '100 000 – 135 000 CAD / an', min: 100000, max: 135000, currency: 'CAD', period: SALARY_PERIOD.year },
    tags: ['CDI', 'DevOps', 'Kubernetes', 'AWS'],
    isRemote: true,
  },
  {
    title: 'Data Engineer (Python)',
    company: 'Clio',
    location: 'Vancouver, BC, Canada',
    description:
      "Bâtissez des pipelines de données fiables pour une legaltech de référence. " +
      "Python, Airflow, dbt, entrepôt Snowflake.",
    applyUrl: 'https://www.clio.com/about/careers/',
    postedAt: null,
    salary: { label: '95 000 – 130 000 CAD / an', min: 95000, max: 130000, currency: 'CAD', period: SALARY_PERIOD.year },
    tags: ['CDI', 'Data', 'Python', 'Snowflake'],
    isRemote: false,
  },
]

/** Case/diacritics-insensitive haystack for the lightweight local filtering. */
const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

function matches(offer: CuratedOffer, keywords?: string, location?: string): boolean {
  const haystack = normalize(
    [offer.title, offer.company ?? '', offer.description, offer.location, offer.tags.join(' ')].join(' '),
  )
  const keywordOk = !keywords?.trim() || normalize(keywords).split(/\s+/).some((term) => haystack.includes(term))
  const locationOk = !location?.trim() || normalize(offer.location).includes(normalize(location))
  return keywordOk && locationOk
}

export const internationalProvider: JobProvider = {
  id: JOB_SOURCE.international,

  // Curated and self-contained — always available, no API key required.
  isConfigured: () => true,

  // The curated set is filtered locally on keywords/location only.
  supportedFilters: [],

  async search({ keywords, location, limit }: JobSearchQuery): Promise<JobSearchOutcome> {
    const filtered = CANADA_DEVELOPER_OFFERS.filter((offer) => matches(offer, keywords, location))
    const jobs = filtered.slice(0, limit).map<NormalizedJob>((offer, index) => ({
      ...offer,
      id: `${JOB_SOURCE.international}:canada:${index}`,
      source: JOB_SOURCE.international,
    }))
    return { jobs, total: filtered.length }
  },
}

export const __testing = { CANADA_DEVELOPER_OFFERS, matches }
