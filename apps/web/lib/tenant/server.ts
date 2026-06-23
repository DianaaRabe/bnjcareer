// ─────────────────────────────────────────────────────────────────────────────
// Server-side tenant resolution
// Use in Server Components, Route Handlers, and middleware.
// ─────────────────────────────────────────────────────────────────────────────

import { headers } from 'next/headers'
import {
  resolveTenantFromHostname,
  resolveTenantFromQuery,
  getTenantConfig,
  DEFAULT_TENANT,
} from '@/tenants/registry'
import type { TenantConfig, TenantId } from '@/tenants/types'

/** Header injected by middleware — always set */
export const TENANT_HEADER = 'x-tenant-id'

/**
 * Get the active tenant config in a Server Component or Route Handler.
 * Reads the `x-tenant-id` header injected by middleware.
 * Falls back to FR if header is absent.
 */
export function getTenant(): TenantConfig {
  const headersList = headers()
  const tenantId = (headersList.get(TENANT_HEADER) ?? DEFAULT_TENANT) as TenantId
  return getTenantConfig(tenantId)
}

/**
 * Get only the tenant ID (cheaper — avoids loading the full config).
 */
export function getTenantId(): TenantId {
  const headersList = headers()
  return (headersList.get(TENANT_HEADER) ?? DEFAULT_TENANT) as TenantId
}

/**
 * Generate per-tenant CSS variable injection string.
 * Used in the root layout's <style> tag.
 */
export function buildTenantCSSVars(config: TenantConfig): string {
  const { colors, displayFont } = config.branding
  const fontLine = displayFont
    ? `\n      --brand-font-display: ${displayFont};`
    : ''
  return `
    :root {
      --brand-primary: ${colors.primary};
      --brand-dark:    ${colors.dark};
      --brand-light:   ${colors.light};
      --brand-accent:  ${colors.accent};
      --brand-bg:      ${colors.bg};
      --brand-subtle:  ${colors.subtle};${fontLine}
    }
  `.trim()
}
