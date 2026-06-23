// ─────────────────────────────────────────────────────────────────────────────
// Tenant Type System
// Single source of truth for all tenant-driven configuration.
// Adding a new tenant = add a config file + register it in registry.ts.
// ─────────────────────────────────────────────────────────────────────────────

export type TenantId = 'fr' | 'africa' | 'community'

export type JobSource = 'indeed' | 'linkedin' | 'hellowork' | 'cabinet' | 'immigration'
export type JobProviderType = 'aggregator' | 'local-db'

export type Locale = 'fr' | 'en' | 'he'
export type Dir = 'ltr' | 'rtl'

// ── Branding ──────────────────────────────────────────────────────────────────

export interface TenantBranding {
  /** App name displayed in header, metadata, etc. */
  name: string
  /** Short tagline shown below logo in sidebar */
  tagline: string
  /** Space-separated RGB values for Tailwind CSS variable injection.
   *  Example: '89 2 147' (for #590293)
   *  These are injected as --brand-primary etc. at the :root level.
   */
  colors: {
    primary: string   // --brand-primary
    dark: string      // --brand-dark
    light: string     // --brand-light
    accent: string    // --brand-accent
    bg: string        // --brand-bg
    subtle: string    // --brand-100 (soft tint for cards/badges)
  }
  /** Logo path (relative to /public) or absolute URL.
   *  Leave empty to auto-render a styled text mark in the sidebar. */
  logo: string
  /** Favicon path */
  favicon: string
  /**
   * Optional Google Fonts CSS2 URL for a premium display typeface.
   * Injected as <link> in the root layout for this tenant only.
   * Example: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap'
   */
  googleFontUrl?: string
  /**
   * CSS font-family string for display headings (h1, h2).
   * Injected as --brand-font-display CSS variable.
   * Example: "'DM Serif Display', Georgia, serif"
   */
  displayFont?: string
}

// ── SEO ───────────────────────────────────────────────────────────────────────

export interface TenantSEO {
  title: string
  description: string
  ogImage: string
  /** Canonical base URL, e.g. 'https://fr.bnjcareer.com' */
  canonicalBase: string
  keywords: string[]
}

// ── Features (Feature Flags) ──────────────────────────────────────────────────

export interface TenantFeatures {
  /** Apify-based job aggregators (Indeed, LinkedIn, HelloWork) */
  jobAggregators: boolean
  /** Local Supabase job database (community tenant) */
  localJobs: boolean
  /** Sources enabled within aggregator tab */
  aggregatorSources: JobSource[]
  /** Formations / e-learning module */
  formations: boolean
  /** Coaching session booking */
  coaching: boolean
  /** ATS CV Optimizer */
  cvOptimizer: boolean
  /** CandiBoost — email application sender */
  candiboost: boolean
  /** Resources library */
  resources: boolean
  /** Messaging between coach ↔ candidates */
  messaging: boolean
  /** Admin dashboard (companies + jobs CRUD) */
  adminDashboard: boolean
}

// ── Jobs Configuration ─────────────────────────────────────────────────────────

export interface TenantJobsConfig {
  provider: JobProviderType
  /** Default search location pre-filled in search bars */
  defaultLocation: string
  /** Default search keywords pre-filled */
  defaultKeywords: string
}

// ── Landing / Hero ────────────────────────────────────────────────────────────

export interface TenantHero {
  headline: string
  subheadline: string
  ctaLabel: string
  ctaHref: string
}

// ── Full Tenant Config ────────────────────────────────────────────────────────

export interface TenantConfig {
  id: TenantId
  locale: Locale
  dir: Dir
  branding: TenantBranding
  seo: TenantSEO
  features: TenantFeatures
  jobs: TenantJobsConfig
  hero: TenantHero
}
