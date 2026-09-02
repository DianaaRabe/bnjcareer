import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { JOB_FILTER_KIND, JOB_SOURCE } from '@/lib/jobs/index.js'
import { listConfiguredSources, searchJobs } from '../jobsService.js'

// Input validation only — which sources are configured depends on the local .env.
describe('searchJobs', () => {
  it('rejects an unknown source', async () => {
    await assert.rejects(() => searchJobs({ source: 'MONSTER' }), /Invalid job search criteria/)
  })

  it('rejects a missing source', async () => {
    await assert.rejects(() => searchJobs({ keywords: 'dev' }), /Invalid job search criteria/)
  })

  it('rejects a limit above the allowed maximum', async () => {
    await assert.rejects(
      () => searchJobs({ source: JOB_SOURCE.indeed, limit: 500 }),
      /Invalid job search criteria/,
    )
  })
})

describe('listConfiguredSources', () => {
  it('only ever reports known sources, each with its supported filters', () => {
    const knownSources = Object.values(JOB_SOURCE)
    const knownFilters = Object.values(JOB_FILTER_KIND)

    for (const { id, supportedFilters } of listConfiguredSources()) {
      assert.ok(knownSources.includes(id))
      assert.ok(supportedFilters.every((filter) => knownFilters.includes(filter)))
    }
  })
})
