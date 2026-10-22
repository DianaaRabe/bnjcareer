import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { resolveJobContact } from '../resolveContact.js'
import {
  CONTACT_CONFIDENCE,
  CONTACT_SOURCE,
  type ContactCandidate,
  type ContactEnricher,
  type ContactQuery,
} from '../types.js'

const candidate = (
  email: string,
  source: ContactCandidate['source'],
  confidence: ContactCandidate['confidence'],
): ContactCandidate => ({ email, contactName: null, source, confidence })

/** A provider returning a fixed result and counting how often it was consulted. */
const fakeEnricher = (
  id: ContactEnricher['id'],
  found: ContactCandidate[],
  overrides: Partial<ContactEnricher> = {},
): ContactEnricher & { calls: number } => {
  const enricher = {
    id,
    calls: 0,
    isConfigured: () => true,
    async findContacts(): Promise<ContactCandidate[]> {
      enricher.calls += 1
      return found
    },
    ...overrides,
  }
  return enricher as ContactEnricher & { calls: number }
}

const throwingEnricher = (id: ContactEnricher['id']): ContactEnricher => ({
  id,
  isConfigured: () => true,
  async findContacts() {
    throw new Error('provider exploded')
  },
})

const query: ContactQuery = { companyName: 'Acme', companyWebsite: null }

describe('resolveJobContact', () => {
  it('uses an address carried by the offer and skips the providers entirely', async () => {
    const site = fakeEnricher(CONTACT_SOURCE.site, [candidate('contact@acme.fr', 'SITE', 'VERIFIED')])

    const resolution = await resolveJobContact({ ...query, description: 'Ecrivez a rh@acme.fr svp' }, [site])

    assert.equal(resolution.best?.email, 'rh@acme.fr')
    assert.equal(resolution.best?.source, CONTACT_SOURCE.offer)
    assert.equal(site.calls, 0, 'providers must not run when the offer already carries a contact')
  })

  it('returns the first verified provider result, in chain order', async () => {
    const site = fakeEnricher(CONTACT_SOURCE.site, [candidate('recrutement@acme.fr', 'SITE', 'VERIFIED')])
    const lusha = fakeEnricher(CONTACT_SOURCE.lusha, [candidate('hr@acme.fr', 'LUSHA', 'VERIFIED')])

    const resolution = await resolveJobContact(query, [site, lusha])

    assert.equal(resolution.best?.email, 'recrutement@acme.fr')
    assert.equal(lusha.calls, 0, 'a paid provider must not run once a verified address is found')
  })

  it('never promotes a pattern guess to a sendable contact, and keeps trying', async () => {
    const site = fakeEnricher(CONTACT_SOURCE.site, [candidate('contact@acme.fr', 'SITE', 'GUESSED')])
    const lusha = fakeEnricher(CONTACT_SOURCE.lusha, [candidate('rh@acme.fr', 'LUSHA', 'VERIFIED')])

    const resolution = await resolveJobContact(query, [site, lusha])

    assert.equal(resolution.best?.email, 'rh@acme.fr')
    assert.deepEqual(
      resolution.guessed.map((entry) => entry.email),
      ['contact@acme.fr'],
    )
    assert.equal(lusha.calls, 1)
  })

  it('reports only guesses with a null best, so the application routes to review', async () => {
    const site = fakeEnricher(CONTACT_SOURCE.site, [candidate('contact@acme.fr', 'SITE', 'GUESSED')])

    const resolution = await resolveJobContact(query, [site])

    assert.equal(resolution.best, null)
    assert.equal(resolution.guessed.length, 1)
    assert.deepEqual(resolution.failures, [])
  })

  it('continues past a failing provider and records the failure', async () => {
    const lusha = fakeEnricher(CONTACT_SOURCE.lusha, [candidate('rh@acme.fr', 'LUSHA', 'VERIFIED')])

    const resolution = await resolveJobContact(query, [throwingEnricher(CONTACT_SOURCE.site), lusha])

    assert.equal(resolution.best?.email, 'rh@acme.fr')
    assert.equal(resolution.failures.length, 1)
    assert.equal(resolution.failures[0].source, CONTACT_SOURCE.site)
    assert.ok(resolution.failures[0].detail.includes('provider exploded'))
  })

  it('skips an unconfigured provider without calling it', async () => {
    const disabled = fakeEnricher(CONTACT_SOURCE.lusha, [candidate('hr@acme.fr', 'LUSHA', 'VERIFIED')], {
      isConfigured: () => false,
    })

    const resolution = await resolveJobContact(query, [disabled])

    assert.equal(disabled.calls, 0)
    assert.equal(resolution.best, null)
    assert.deepEqual(resolution.failures, [])
  })

  it('returns an empty resolution when nothing is found anywhere', async () => {
    const resolution = await resolveJobContact(query, [fakeEnricher(CONTACT_SOURCE.site, [])])

    assert.equal(resolution.best, null)
    assert.deepEqual(resolution.verified, [])
    assert.deepEqual(resolution.guessed, [])
    assert.deepEqual(resolution.failures, [])
  })
})
