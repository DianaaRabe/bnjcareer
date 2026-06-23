// ─────────────────────────────────────────────────────────────────────────────
// Tenant Registry
// Maps hostnames → tenant IDs.
// Used by middleware (server) and getTenant() helper.
// ─────────────────────────────────────────────────────────────────────────────

import type { TenantId, TenantConfig } from './types'
import frConfig from './fr/config'
import africaConfig from './africa/config'
import communityConfig from './community/config'

// ── Config map ────────────────────────────────────────────────────────────────

export const TENANT_CONFIGS: Record<TenantId, TenantConfig> = {
  fr:        frConfig,
  africa:    africaConfig,
  community: communityConfig,
}

export const DEFAULT_TENANT: TenantId = 'fr'

// ── Hostname → TenantId mapping ───────────────────────────────────────────────

const HOSTNAME_MAP: Record<string, TenantId> = {
  // Production domains
  'fr.bnjcareer.com':        'fr',
  'africa.bnjcareer.com':    'africa',
  'community.bnjcareer.com': 'community',
  // Also support root domain as FR
  'bnjcareer.com':           'fr',
  'www.bnjcareer.com':       'fr',
  // Dev subdomains (using /etc/hosts or tools like localcan/pong)
  'fr.localhost':             'fr',
  'africa.localhost':         'africa',
  'community.localhost':      'community',
  // Vercel preview pattern: community-bnj.vercel.app
  'fr-bnj.vercel.app':        'fr',
  'africa-bnj.vercel.app':    'africa',
  'community-bnj.vercel.app': 'community',
}

/**
 * Resolve tenant from a hostname string.
 * Falls back to DEFAULT_TENANT if the hostname is unknown.
 */
export function resolveTenantFromHostname(hostname: string): TenantId {
  // Strip port if present (localhost:3000 → localhost)
  const host = hostname.split(':')[0]
  return HOSTNAME_MAP[host] ?? DEFAULT_TENANT
}

/**
 * Resolve tenant from a query param (for local dev without subdomain).
 * Usage: http://localhost:3000?tenant=community
 */
export function resolveTenantFromQuery(query: string | null): TenantId | null {
  if (!query) return null
  if (query in TENANT_CONFIGS) return query as TenantId
  return null
}

/**
 * Get a tenant config by ID. Always returns a valid config.
 */
export function getTenantConfig(id: TenantId): TenantConfig {
  return TENANT_CONFIGS[id] ?? TENANT_CONFIGS[DEFAULT_TENANT]
}

/** All available tenant IDs */
export const TENANT_IDS = Object.keys(TENANT_CONFIGS) as TenantId[]
