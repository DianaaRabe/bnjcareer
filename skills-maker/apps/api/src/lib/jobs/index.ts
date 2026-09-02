import { apifyProviders } from './apifyProvider.js'
import { franceTravailProvider } from './franceTravailProvider.js'
import { joobleProvider } from './joobleProvider.js'
import type { JobProvider, JobSourceId } from './types.js'

// Order drives the client tabs, and the first configured one is the default:
// France Travail leads because it serves live offers for free, where the Apify
// sources open on pre-downloaded runs.
const PROVIDERS: JobProvider[] = [franceTravailProvider, ...apifyProviders, joobleProvider]

/** Sources whose API keys are present — the only ones a client may query. */
export function getConfiguredProviders(): JobProvider[] {
  return PROVIDERS.filter((provider) => provider.isConfigured())
}

export function getProvider(id: JobSourceId): JobProvider | null {
  return PROVIDERS.find((provider) => provider.id === id) ?? null
}

export * from './types.js'
