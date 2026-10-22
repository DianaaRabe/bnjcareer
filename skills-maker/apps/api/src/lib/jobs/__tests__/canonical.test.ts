import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { canonicalizeUrl, canonicalJobKey, dedupeJobs, normalizeText } from '../canonical.js'
import { JOB_SOURCE, type NormalizedJob } from '../types.js'

const job = (overrides: Partial<NormalizedJob>): NormalizedJob => ({
  id: 'id',
  source: JOB_SOURCE.indeed,
  title: 'Développeur',
  company: 'Acme',
  location: 'Paris',
  description: 'Une offre',
  applyUrl: 'https://example.com/job/1',
  postedAt: null,
  salary: null,
  tags: [],
  isRemote: false,
  ...overrides,
})

describe('canonicalizeUrl', () => {
  it('lowercases the host, drops www, fragment and tracking params, and sorts the rest', () => {
    const url = canonicalizeUrl('https://WWW.Example.com/Job/123/?utm_source=x&b=2&a=1&gclid=z#section')

    assert.equal(url, 'https://example.com/Job/123?a=1&b=2')
  })

  it('removes a single trailing slash but keeps the root path', () => {
    assert.equal(canonicalizeUrl('https://example.com/job/'), 'https://example.com/job')
    assert.equal(canonicalizeUrl('https://example.com/'), 'https://example.com/')
  })

  it('drops default ports and credentials', () => {
    assert.equal(canonicalizeUrl('https://user:pass@example.com:443/job'), 'https://example.com/job')
  })

  it('rejects non-http protocols and unparseable values', () => {
    assert.equal(canonicalizeUrl('mailto:hr@acme.fr'), null)
    assert.equal(canonicalizeUrl('javascript:alert(1)'), null)
    assert.equal(canonicalizeUrl('not a url'), null)
    assert.equal(canonicalizeUrl(''), null)
    assert.equal(canonicalizeUrl(null), null)
  })
})

describe('normalizeText', () => {
  it('strips accents, case and punctuation', () => {
    assert.equal(normalizeText('Café "du Port" — Île-de-France'), 'cafe du port ile de france')
  })

  it('treats null and undefined as empty', () => {
    assert.equal(normalizeText(null), '')
    assert.equal(normalizeText(undefined), '')
  })
})

describe('canonicalJobKey', () => {
  it('collapses the same URL published by two sources to one key', () => {
    const indeed = canonicalJobKey({ applyUrl: 'https://acme.fr/jobs/42?utm_source=indeed', source: JOB_SOURCE.indeed })
    const linkedin = canonicalJobKey({ applyUrl: 'https://acme.fr/jobs/42', source: JOB_SOURCE.linkedin })

    assert.equal(indeed, linkedin)
  })

  it('falls back to source + externalId when the URL is unusable', () => {
    const key = canonicalJobKey({ applyUrl: null, source: JOB_SOURCE.franceTravail, externalId: 'abc123' })

    assert.equal(key, 'src:FRANCE_TRAVAIL:abc123')
  })

  it('falls back to normalized company + title + location as the last resort', () => {
    const a = canonicalJobKey({ applyUrl: null, company: 'ACME Énergie', title: 'Chef de Projet', location: 'Lyon' })
    const b = canonicalJobKey({ applyUrl: null, company: 'acme energie', title: 'chef de projet', location: 'lyon' })

    assert.equal(a, b)
  })
})

describe('dedupeJobs', () => {
  it('collapses the same vacancy across sources and keeps the most complete record', () => {
    const thin = job({ source: JOB_SOURCE.linkedin, applyUrl: 'https://acme.fr/jobs/42', description: 'Court' })
    const rich = job({ source: JOB_SOURCE.indeed, applyUrl: 'https://acme.fr/jobs/42?utm_source=indeed', description: 'x'.repeat(500) })

    const { jobs, duplicatesRemoved } = dedupeJobs([thin, rich])

    assert.equal(jobs.length, 1)
    assert.equal(duplicatesRemoved, 1)
    assert.equal(jobs[0].source, JOB_SOURCE.indeed)
  })

  it('keeps distinct vacancies apart and preserves first-appearance order', () => {
    const first = job({ title: 'A', applyUrl: 'https://a.fr/1' })
    const second = job({ title: 'B', applyUrl: 'https://b.fr/2' })
    const firstAgain = job({ title: 'A', applyUrl: 'https://a.fr/1', company: null, location: '' })

    const { jobs, duplicatesRemoved } = dedupeJobs([first, second, firstAgain])

    assert.deepEqual(jobs.map((entry) => entry.title), ['A', 'B'])
    assert.equal(duplicatesRemoved, 1)
  })

  it('is a no-op on an already-unique list', () => {
    const { jobs, duplicatesRemoved } = dedupeJobs([job({ applyUrl: 'https://a.fr/1' }), job({ applyUrl: 'https://b.fr/2' })])

    assert.equal(jobs.length, 2)
    assert.equal(duplicatesRemoved, 0)
  })
})
