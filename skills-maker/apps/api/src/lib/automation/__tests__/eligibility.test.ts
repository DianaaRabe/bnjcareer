import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { resolveAutomationSettings, type AutomationSettingsRow } from '../constants.js'
import {
  evaluateJobEligibility,
  isValidRecipient,
  matchesContractTypes,
  matchesKeywords,
  matchesLocations,
  remainingBudget,
} from '../eligibility.js'
import type { CanonicalJob } from '../types.js'

const job = (overrides: Partial<CanonicalJob> = {}): CanonicalJob => ({
  id: 'j1',
  source: 'INDEED',
  title: 'Développeur Full Stack',
  company: 'Acme',
  location: 'Paris',
  description: 'Nous recherchons un développeur en CDI sur Paris.',
  applyUrl: 'https://acme.fr/jobs/1',
  postedAt: null,
  salary: null,
  tags: ['CDI', 'Paris'],
  isRemote: false,
  canonicalKey: 'url:https://acme.fr/jobs/1',
  discoveredAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

const settings = (overrides: Partial<AutomationSettingsRow> = {}) =>
  resolveAutomationSettings({
    enabled: true,
    frequency: 'WEEKLY',
    maxApplicationsPerRun: 3,
    maxApplicationsPerDay: 5,
    minMatchScore: 65,
    approvalMode: true,
    keywords: [],
    locations: [],
    contractTypes: [],
    ...overrides,
  })

describe('matchesKeywords', () => {
  it('accepts everything when no keyword is configured', () => {
    assert.equal(matchesKeywords(job(), []), true)
  })

  it('matches accent- and case-insensitively', () => {
    assert.equal(matchesKeywords(job(), ['developpeur']), true)
    assert.equal(matchesKeywords(job({ title: 'Développeur' }), ['développeur']), true)
  })

  it('rejects an offer that matches none of the keywords', () => {
    assert.equal(matchesKeywords(job(), ['comptable']), false)
  })
})

describe('matchesLocations', () => {
  it('accepts every offer when no location is configured', () => {
    assert.equal(matchesLocations(job(), []), true)
  })

  it('matches the location text case-insensitively', () => {
    assert.equal(matchesLocations(job(), ['paris']), true)
  })

  it('always accepts a remote offer, whatever the configured area', () => {
    assert.equal(matchesLocations(job({ isRemote: true, location: '' }), ['Marseille']), true)
  })

  it('rejects an offer outside the requested area', () => {
    assert.equal(matchesLocations(job({ location: 'Bordeaux', tags: [] }), ['Lille']), false)
  })
})

describe('matchesContractTypes', () => {
  it('accepts everything when no contract type is configured', () => {
    assert.equal(matchesContractTypes(job(), []), true)
  })

  it('recognises the CDI label from the tags', () => {
    assert.equal(matchesContractTypes(job(), ['PERMANENT']), true)
  })

  it('recognises the CDD label from the description', () => {
    assert.equal(matchesContractTypes(job({ tags: [], description: 'Poste en CDD de 12 mois' }), ['FIXED_TERM']), true)
  })

  it('is conservative: an offer that states no contract type fails an explicit request', () => {
    assert.equal(matchesContractTypes(job({ tags: [], description: 'Nous recrutons' }), ['PERMANENT']), false)
  })
})

describe('isValidRecipient', () => {
  it('accepts a hiring mailbox and rejects machine mailboxes', () => {
    assert.equal(isValidRecipient('recrutement@acme.fr'), true)
    assert.equal(isValidRecipient('no-reply@acme.fr'), false)
    assert.equal(isValidRecipient('dpo@acme.fr'), false)
    assert.equal(isValidRecipient('not-an-email'), false)
    assert.equal(isValidRecipient(null), false)
  })
})

describe('remainingBudget', () => {
  it('returns the tighter of the run and daily allowance', () => {
    assert.equal(remainingBudget({ sentThisRun: 1, sentToday: 1 }, settings()), 2)
    assert.equal(remainingBudget({ sentThisRun: 0, sentToday: 4 }, settings()), 1)
  })

  it('never goes negative once a ceiling is exceeded', () => {
    assert.equal(remainingBudget({ sentThisRun: 9, sentToday: 9 }, settings()), 0)
  })
})

describe('evaluateJobEligibility', () => {
  it('marks already-applied before anything else, even with a bad score', () => {
    const verdict = evaluateJobEligibility({ job: job(), matchScore: 10, settings: settings(), alreadyApplied: true })

    assert.equal(verdict.eligible, false)
    assert.equal(verdict.skipReason, 'ALREADY_APPLIED')
  })

  it('rejects a score below the configured minimum', () => {
    const verdict = evaluateJobEligibility({ job: job(), matchScore: 64, settings: settings(), alreadyApplied: false })

    assert.equal(verdict.skipReason, 'MATCH_TOO_LOW')
  })

  it('treats a missing score as zero', () => {
    const verdict = evaluateJobEligibility({ job: job(), matchScore: null, settings: settings(), alreadyApplied: false })

    assert.equal(verdict.skipReason, 'MATCH_TOO_LOW')
  })

  it('rejects an offer filtered out by keywords', () => {
    const verdict = evaluateJobEligibility({
      job: job(),
      matchScore: 90,
      settings: settings({ keywords: ['data'] }),
      alreadyApplied: false,
    })

    assert.equal(verdict.skipReason, 'SKIPPED')
    assert.equal(verdict.detail, 'keywords')
  })

  it('accepts an offer that clears every gate', () => {
    const verdict = evaluateJobEligibility({
      job: job(),
      matchScore: 80,
      settings: settings({ keywords: ['développeur'], locations: ['Paris'], contractTypes: ['PERMANENT'] }),
      alreadyApplied: false,
    })

    assert.equal(verdict.eligible, true)
    assert.equal(verdict.skipReason, null)
  })
})
