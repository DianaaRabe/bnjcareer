// ─────────────────────────────────────────────────────────────────────────────
// Job Provider Factory
// Returns the correct JobProvider based on the active tenant config.
// Zero conditional logic in components — swap datasource here.
// ─────────────────────────────────────────────────────────────────────────────

import type { JobProviderType } from '@/tenants/types'
import type { JobProvider } from './types'
import { AggregatorJobProvider } from './aggregator'
import { LocalDatabaseJobProvider } from './local-db'

const instances: Partial<Record<JobProviderType, JobProvider>> = {}

/**
 * Returns a singleton JobProvider for the given provider type.
 * Singletons avoid re-creating providers on every request.
 */
export function getJobProvider(type: JobProviderType): JobProvider {
  if (!instances[type]) {
    switch (type) {
      case 'aggregator':
        instances[type] = new AggregatorJobProvider()
        break
      case 'local-db':
        instances[type] = new LocalDatabaseJobProvider()
        break
      default:
        throw new Error(`Unknown job provider type: ${type}`)
    }
  }
  return instances[type]!
}
