import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { ContactCandidate } from '@/lib/enrichment/types.js'
import type { ContactResolution } from '@/lib/enrichment/resolveContact.js'
import { JOB_SOURCE, type JobProvider, type NormalizedJob } from '@/lib/jobs/types.js'
import { resolveAutomationSettings, type AutomationSettingsRow } from '../constants.js'
import { buildSearchQuery, runApplicationPipeline, startOfDayUtc, type CvContext, type EngineDependencies } from '../engine.js'
import type { AutomationStore, SavePreparedInput } from '../store.js'
import type { CanonicalJob } from '../types.js'

// ── Fixtures ─────────────────────────────────────────────────────────────────

const cv: CvContext = { extractedData: { professionalTitle: 'Dev' }, profile: null }

const rawJob = (overrides: Partial<NormalizedJob> = {}): NormalizedJob => ({
  id: 'FRANCE_TRAVAIL:1',
  source: JOB_SOURCE.franceTravail,
  title: 'Développeur Backend',
  company: 'Acme',
  location: 'Paris',
  description: 'Nous recherchons un développeur backend en CDI à Paris.',
  applyUrl: 'https://acme.fr/jobs/1',
  postedAt: null,
  salary: null,
  tags: ['CDI'],
  isRemote: false,
  ...overrides,
})

const settings = (overrides: Partial<AutomationSettingsRow> = {}) =>
  resolveAutomationSettings({
    enabled: true,
    frequency: 'WEEKLY',
    maxApplicationsPerRun: 5,
    maxApplicationsPerDay: 10,
    minMatchScore: 65,
    approvalMode: true,
    keywords: [],
    locations: [],
    contractTypes: [],
    ...overrides,
  })

const fakeProvider = (
  id: JobProvider['id'],
  jobs: NormalizedJob[],
  overrides: Partial<JobProvider> = {},
): JobProvider & { calls: number } => {
  const provider = {
    id,
    calls: 0,
    isConfigured: () => true,
    supportedFilters: [] as JobProvider['supportedFilters'],
    async search() {
      provider.calls += 1
      return { jobs, total: jobs.length }
    },
    ...overrides,
  }
  return provider as JobProvider & { calls: number }
}

const contact = (email: string, confidence: ContactCandidate['confidence']): ContactCandidate => ({
  email,
  contactName: null,
  source: 'SITE',
  confidence,
})

const resolution = (verified: ContactCandidate[] = [], guessed: ContactCandidate[] = []): ContactResolution => ({
  verified,
  guessed,
  failures: [],
  best: verified[0] ?? null,
})

interface FakeStore extends AutomationStore {
  saved: SavePreparedInput[]
  contacts: { jobOfferId: string; contact: ContactCandidate }[]
  events: { applicationId: string; type: string; metadata?: Record<string, unknown> }[]
}

const fakeStore = (overrides: Partial<AutomationStore> = {}): FakeStore => {
  const saved: SavePreparedInput[] = []
  const contacts: FakeStore['contacts'] = []
  const events: FakeStore['events'] = []
  return {
    saved,
    contacts,
    events,
    async findApplied() {
      return new Map()
    },
    async countPreparedSince() {
      return 0
    },
    async savePrepared(input) {
      saved.push(input)
      return { applicationId: `app-${saved.length}`, jobOfferId: `offer-${saved.length}`, created: true }
    },
    async saveContact(jobOfferId, entry) {
      contacts.push({ jobOfferId, contact: entry })
    },
    async recordEvent(applicationId, type, metadata) {
      events.push({ applicationId, type, metadata })
    },
    ...overrides,
  }
}

/** A ready-to-run dependency set: one provider, a passing score, a verified contact, a letter. */
const deps = (overrides: Partial<EngineDependencies> = {}): EngineDependencies => ({
  store: fakeStore(),
  providers: [fakeProvider(JOB_SOURCE.franceTravail, [rawJob()])],
  match: async () => 90,
  resolveContact: async () => resolution([contact('recrutement@acme.fr', 'VERIFIED')]),
  generateLetter: async () => ({ content: 'Lettre. '.repeat(50), model: 'test-model' }),
  ...overrides,
})

const run = (input: Partial<Parameters<typeof runApplicationPipeline>[0]> = {}, d: Partial<EngineDependencies> = {}) =>
  runApplicationPipeline({ candidateId: 'candidate-a', settings: settings(), cv, ...input }, deps(d))

// ── Tests ────────────────────────────────────────────────────────────────────

describe('runApplicationPipeline — consent gate', () => {
  it('does nothing at all when automation is disabled', async () => {
    const provider = fakeProvider(JOB_SOURCE.franceTravail, [rawJob()])
    const store = fakeStore()

    const outcome = await runApplicationPipeline(
      { candidateId: 'candidate-a', settings: settings({ enabled: false }), cv },
      deps({ providers: [provider], store }),
    )

    assert.equal(outcome.enabled, false)
    assert.equal(provider.calls, 0, 'a disabled candidate must not trigger any discovery call')
    assert.equal(store.saved.length, 0)
  })
})

describe('runApplicationPipeline — candidate isolation', () => {
  it("never sees another candidate's applications", async () => {
    const key = 'url:https://acme.fr/jobs/1'
    // Candidate B has already applied; candidate A has not.
    const store = fakeStore({
      async findApplied(candidateId) {
        return candidateId === 'candidate-b' ? new Map([[key, { applicationId: 'x', stage: null }]]) : new Map()
      },
    })

    const forA = await runApplicationPipeline({ candidateId: 'candidate-a', settings: settings(), cv }, deps({ store }))
    const forB = await runApplicationPipeline({ candidateId: 'candidate-b', settings: settings(), cv }, deps({ store }))

    assert.equal(forA.prepared.length, 1)
    assert.equal(forB.prepared.length, 0)
    assert.equal(forB.skipped[0].reason, 'ALREADY_APPLIED')
  })

  it('scopes the daily budget to the candidate being processed', async () => {
    const seen: string[] = []
    const store = fakeStore({
      async countPreparedSince(candidateId) {
        seen.push(candidateId)
        return 0
      },
    })

    await runApplicationPipeline({ candidateId: 'candidate-a', settings: settings(), cv }, deps({ store }))

    assert.deepEqual(seen, ['candidate-a'])
  })
})

describe('runApplicationPipeline — idempotency', () => {
  it('skips a vacancy the candidate already applied to, without paying for a match', async () => {
    const key = 'url:https://acme.fr/jobs/1'
    let matchCalls = 0
    const store = fakeStore({
      async findApplied() {
        return new Map([[key, { applicationId: 'existing', stage: 'READY_TO_SEND' }]])
      },
    })

    const outcome = await runApplicationPipeline(
      { candidateId: 'candidate-a', settings: settings(), cv },
      deps({
        store,
        match: async () => {
          matchCalls += 1
          return 90
        },
      }),
    )

    assert.equal(outcome.prepared.length, 0)
    assert.equal(outcome.skipped[0].reason, 'ALREADY_APPLIED')
    assert.equal(matchCalls, 0, 'already-applied is a free check and must run before matching')
  })

  it('treats a losing race at write time as already-applied, not as a failure', async () => {
    const store = fakeStore({
      async savePrepared() {
        return { applicationId: 'existing', jobOfferId: 'offer', created: false }
      },
    })

    const outcome = await runApplicationPipeline({ candidateId: 'candidate-a', settings: settings(), cv }, deps({ store }))

    assert.equal(outcome.prepared.length, 0)
    assert.equal(outcome.skipped[0].reason, 'ALREADY_APPLIED')
    assert.deepEqual(outcome.failures, [])
  })
})

describe('runApplicationPipeline — normalization & deduplication', () => {
  it('collapses the same vacancy found on two sources into a single application', async () => {
    const indeed = fakeProvider(JOB_SOURCE.indeed, [rawJob({ source: JOB_SOURCE.indeed, description: 'court' })])
    const franceTravail = fakeProvider(JOB_SOURCE.franceTravail, [
      rawJob({ source: JOB_SOURCE.franceTravail, description: 'x'.repeat(400) }),
    ])

    const outcome = await runApplicationPipeline(
      { candidateId: 'candidate-a', settings: settings(), cv },
      deps({ providers: [indeed, franceTravail] }),
    )

    assert.equal(outcome.discovered.length, 2)
    assert.equal(outcome.deduplicated.length, 1)
    assert.equal(outcome.duplicatesRemoved, 1)
    assert.equal(outcome.prepared.length, 1)
  })
})

describe('runApplicationPipeline — source and model failures', () => {
  it('records a provider outage and keeps processing the healthy source', async () => {
    const broken = fakeProvider(JOB_SOURCE.indeed, [], {
      async search() {
        throw new Error('upstream timeout')
      },
    })
    const healthy = fakeProvider(JOB_SOURCE.franceTravail, [rawJob()])

    const outcome = await runApplicationPipeline(
      { candidateId: 'candidate-a', settings: settings(), cv },
      deps({ providers: [broken, healthy] }),
    )

    assert.equal(outcome.failures.length, 1)
    assert.equal(outcome.failures[0].source, JOB_SOURCE.indeed)
    assert.ok(outcome.failures[0].detail.includes('upstream timeout'))
    assert.equal(outcome.prepared.length, 1)
  })

  it('routes a job to review when the matcher cannot answer', async () => {
    const store = fakeStore()
    const outcome = await runApplicationPipeline(
      { candidateId: 'candidate-a', settings: settings(), cv },
      deps({ store, match: async () => null }),
    )

    assert.equal(outcome.prepared.length, 0)
    assert.equal(outcome.skipped[0].reason, 'REQUIRES_REVIEW')
    assert.equal(outcome.skipped[0].detail, 'matching_failed')
    assert.equal(store.saved.length, 0)
  })

  it('survives a matcher that throws', async () => {
    const outcome = await runApplicationPipeline(
      { candidateId: 'candidate-a', settings: settings(), cv },
      deps({
        match: async () => {
          throw new Error('LLM exploded')
        },
      }),
    )

    assert.equal(outcome.prepared.length, 0)
    assert.equal(outcome.skipped[0].reason, 'REQUIRES_REVIEW')
    assert.equal(outcome.failures.length, 1)
  })

  it('routes a job to review when the letter cannot be generated', async () => {
    const store = fakeStore()
    const outcome = await runApplicationPipeline(
      { candidateId: 'candidate-a', settings: settings(), cv },
      deps({
        store,
        generateLetter: async () => {
          throw new Error('malformed LLM output')
        },
      }),
    )

    assert.equal(outcome.prepared.length, 0)
    assert.equal(outcome.skipped[0].reason, 'REQUIRES_REVIEW')
    assert.equal(outcome.skipped[0].detail, 'letter_failed')
    assert.equal(store.saved.length, 0)
  })
})

describe('runApplicationPipeline — limits', () => {
  const threeJobs = [
    rawJob({ applyUrl: 'https://acme.fr/jobs/1' }),
    rawJob({ applyUrl: 'https://acme.fr/jobs/2' }),
    rawJob({ applyUrl: 'https://acme.fr/jobs/3' }),
  ]

  it('respects the per-run ceiling and spends the budget on the best matches', async () => {
    const scores: Record<string, number> = {
      'https://acme.fr/jobs/1': 70,
      'https://acme.fr/jobs/2': 95,
      'https://acme.fr/jobs/3': 80,
    }
    const outcome = await runApplicationPipeline(
      { candidateId: 'candidate-a', settings: settings({ maxApplicationsPerRun: 1 }), cv },
      deps({
        providers: [fakeProvider(JOB_SOURCE.franceTravail, threeJobs)],
        match: async (job) => scores[job.applyUrl] ?? 0,
      }),
    )

    assert.equal(outcome.prepared.length, 1)
    assert.equal(outcome.prepared[0].matchScore, 95)
    assert.equal(outcome.skipped.filter((entry) => entry.detail === 'budget').length, 2)
  })

  it('prepares nothing once the daily ceiling is already reached', async () => {
    const store = fakeStore({ async countPreparedSince() { return 10 } })
    const outcome = await runApplicationPipeline(
      { candidateId: 'candidate-a', settings: settings({ maxApplicationsPerDay: 10 }), cv },
      deps({ store, providers: [fakeProvider(JOB_SOURCE.franceTravail, threeJobs)] }),
    )

    assert.equal(outcome.prepared.length, 0)
    assert.equal(store.saved.length, 0)
  })

  it('counts the daily budget from the start of the UTC day', () => {
    assert.equal(startOfDayUtc(new Date('2026-03-04T17:45:12.000Z')).toISOString(), '2026-03-04T00:00:00.000Z')
  })
})

describe('runApplicationPipeline — contact handling', () => {
  it('skips a vacancy whose only address is a machine mailbox', async () => {
    const store = fakeStore()
    const outcome = await runApplicationPipeline(
      { candidateId: 'candidate-a', settings: settings(), cv },
      deps({ store, resolveContact: async () => resolution([contact('no-reply@acme.fr', 'VERIFIED')]) }),
    )

    assert.equal(outcome.prepared.length, 0)
    assert.equal(outcome.skipped[0].reason, 'NO_CONTACT')
    assert.equal(store.saved.length, 0)
  })

  it('skips a vacancy with no contact at all', async () => {
    const outcome = await runApplicationPipeline(
      { candidateId: 'candidate-a', settings: settings(), cv },
      deps({ resolveContact: async () => resolution() }),
    )

    assert.equal(outcome.skipped[0].reason, 'NO_CONTACT')
  })

  it('prepares a guessed contact for review when approval is on', async () => {
    const outcome = await runApplicationPipeline(
      { candidateId: 'candidate-a', settings: settings({ approvalMode: true }), cv },
      deps({ resolveContact: async () => resolution([], [contact('contact@acme.fr', 'GUESSED')]) }),
    )

    assert.equal(outcome.prepared.length, 1)
    assert.equal(outcome.prepared[0].needsReview, true)
  })

  it('refuses a guessed contact outright when automation would send without review', async () => {
    const store = fakeStore()
    const outcome = await runApplicationPipeline(
      { candidateId: 'candidate-a', settings: settings({ approvalMode: false }), cv },
      deps({ store, resolveContact: async () => resolution([], [contact('contact@acme.fr', 'GUESSED')]) }),
    )

    assert.equal(outcome.prepared.length, 0)
    assert.equal(outcome.skipped[0].reason, 'NO_CONTACT')
    assert.equal(store.saved.length, 0, 'a guess must never become an automatic send')
  })
})

describe('runApplicationPipeline — preparation', () => {
  it('stages for approval and persists the contact and an audit event', async () => {
    const store = fakeStore()
    const outcome = await runApplicationPipeline(
      { candidateId: 'candidate-a', settings: settings({ approvalMode: true }), cv },
      deps({ store }),
    )

    assert.equal(outcome.prepared.length, 1)
    assert.equal(store.saved[0].stage, 'READY_TO_SEND')
    assert.equal(store.saved[0].candidateId, 'candidate-a')
    assert.equal(store.saved[0].coverLetterModel, 'test-model')
    assert.equal(store.contacts[0].contact.email, 'recrutement@acme.fr')
    assert.equal(store.events[0].type, 'APPLICATION_PREPARED')
    assert.equal(store.events[0].metadata?.stage, 'READY_TO_SEND')
  })

  it('parks at PREPARING when approval is off — still never a send', async () => {
    const store = fakeStore()
    const outcome = await runApplicationPipeline(
      { candidateId: 'candidate-a', settings: settings({ approvalMode: false }), cv },
      deps({ store }),
    )

    assert.equal(outcome.prepared.length, 1)
    assert.equal(store.saved[0].stage, 'PREPARING')
  })

  it('stamps every discovered job with a canonical key and a discovery time', async () => {
    const outcome = await run({
      settings: settings(),
    })

    assert.ok(outcome.discovered[0].canonicalKey.startsWith('url:'))
    assert.ok(outcome.discovered[0].discoveredAt)
  })
})

describe('buildSearchQuery', () => {
  it('passes keywords, location and supported contract types to the provider', () => {
    const provider: JobProvider = {
      id: JOB_SOURCE.franceTravail,
      isConfigured: () => true,
      supportedFilters: ['CONTRACT_TYPE'],
      async search() {
        return { jobs: [], total: 0 }
      },
    }

    const query = buildSearchQuery(provider, settings({ keywords: ['dev', 'react'], locations: ['Lyon'], contractTypes: ['PERMANENT'] }), 20)

    assert.equal(query.keywords, 'dev react')
    assert.equal(query.location, 'Lyon')
    assert.deepEqual(query.contractTypes, ['PERMANENT'])
    assert.equal(query.limit, 20)
  })

  it('drops a filter the source cannot honour instead of faking it', () => {
    const provider: JobProvider = {
      id: JOB_SOURCE.hellowork,
      isConfigured: () => true,
      supportedFilters: [],
      async search() {
        return { jobs: [], total: 0 }
      },
    }

    const query = buildSearchQuery(provider, settings({ contractTypes: ['PERMANENT'] }), 20)

    assert.equal(query.contractTypes, undefined)
  })

  it('ignores an unknown contract type', () => {
    const provider: JobProvider = {
      id: JOB_SOURCE.franceTravail,
      isConfigured: () => true,
      supportedFilters: ['CONTRACT_TYPE'],
      async search() {
        return { jobs: [], total: 0 }
      },
    }

    const query = buildSearchQuery(provider, settings({ contractTypes: ['NOT_A_TYPE'] }), 20)

    assert.equal(query.contractTypes, undefined)
  })
})
