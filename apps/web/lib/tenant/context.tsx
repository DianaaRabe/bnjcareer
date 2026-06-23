'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Client-side Tenant Context
// Wrap the app with <TenantProvider> in app/layout.tsx.
// Use useTenant() in any Client Component.
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext } from 'react'
import type { TenantConfig } from '@/tenants/types'
import frConfig from '@/tenants/fr/config'

const TenantContext = createContext<TenantConfig>(frConfig)

interface TenantProviderProps {
  config: TenantConfig
  children: React.ReactNode
}

/**
 * Wraps the subtree with the active tenant config.
 * Render server-side in app/layout.tsx — pass the server-resolved config.
 */
export function TenantProvider({ config, children }: TenantProviderProps) {
  return (
    <TenantContext.Provider value={config}>
      {children}
    </TenantContext.Provider>
  )
}

/**
 * Hook to access the active tenant config in any Client Component.
 *
 * @example
 * const { branding, features } = useTenant()
 * if (!features.jobAggregators) return null
 */
export function useTenant(): TenantConfig {
  return useContext(TenantContext)
}

/**
 * Convenience hook — access only feature flags.
 *
 * @example
 * const { cvOptimizer, localJobs } = useFeatures()
 */
export function useFeatures() {
  return useContext(TenantContext).features
}

/**
 * Convenience hook — access only branding.
 */
export function useBranding() {
  return useContext(TenantContext).branding
}
