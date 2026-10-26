import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  emailDomain,
  findEmailInText,
  isApplicationEmail,
  normaliseObfuscation,
  rankApplicationEmails,
  scoreApplicationEmail,
} from '../emailAddresses.js'

describe('isApplicationEmail', () => {
  it('accepts ordinary business addresses', () => {
    assert.equal(isApplicationEmail('recrutement@acme.fr'), true)
    assert.equal(isApplicationEmail('contact@acme-group.com'), true)
    assert.equal(isApplicationEmail('marie.dupont@acme.io'), true)
  })

  it('rejects machine and privacy mailboxes that must never receive a candidature', () => {
    for (const address of [
      'noreply@acme.fr',
      'no-reply@acme.fr',
      'donotreply@acme.fr',
      'postmaster@acme.fr',
      'abuse@acme.fr',
      'dpo@acme.fr',
      'rgpd@acme.fr',
      'webmaster@acme.fr',
    ]) {
      assert.equal(isApplicationEmail(address), false, address)
    }
  })

  it('rejects prefixed forms of a machine mailbox', () => {
    assert.equal(isApplicationEmail('noreply-fr@acme.fr'), false)
    assert.equal(isApplicationEmail('postmaster.eu@acme.fr'), false)
  })

  it('rejects addresses ending in an asset extension', () => {
    assert.equal(isApplicationEmail('logo@2x.png'), false)
    assert.equal(isApplicationEmail('banner.svg'), false)
  })

  it('rejects placeholder and vendor hosts that only appear in page chrome', () => {
    assert.equal(isApplicationEmail('someone@example.com'), false)
    assert.equal(isApplicationEmail('x@sentry.io'), false)
  })

  it('rejects malformed values', () => {
    assert.equal(isApplicationEmail(''), false)
    assert.equal(isApplicationEmail('not-an-email'), false)
    assert.equal(isApplicationEmail('a@b'), false)
    assert.equal(isApplicationEmail(`${'a'.repeat(250)}@acme.fr`), false)
  })
})

describe('scoreApplicationEmail', () => {
  it('ranks recruitment mailboxes above generic ones', () => {
    assert.ok(scoreApplicationEmail('recrutement@acme.fr') > scoreApplicationEmail('contact@acme.fr'))
    assert.ok(scoreApplicationEmail('contact@acme.fr') > scoreApplicationEmail('marie.dupont@acme.fr'))
  })

  it('scores a rejected address below every valid one', () => {
    assert.equal(scoreApplicationEmail('noreply@acme.fr'), -1)
    assert.ok(scoreApplicationEmail('marie.dupont@acme.fr') > -1)
  })
})

describe('rankApplicationEmails', () => {
  it('drops rejects, deduplicates and orders by suitability', () => {
    const ranked = rankApplicationEmails([
      'marie.dupont@acme.fr',
      'noreply@acme.fr',
      'contact@acme.fr',
      'marie.dupont@acme.fr',
      'RECRUTEMENT@acme.fr',
      'logo@2x.png',
    ])
    assert.deepEqual(ranked, ['recrutement@acme.fr', 'contact@acme.fr', 'marie.dupont@acme.fr'])
  })

  it('strips trailing punctuation picked up from prose', () => {
    assert.deepEqual(rankApplicationEmails(['contact@acme.fr.']), ['contact@acme.fr'])
  })
})

describe('normaliseObfuscation', () => {
  it('undoes json escape artefacts so a prefixed address is not captured', () => {
    const cleaned = normaliseObfuscation('x\\u003erecrutement@acme.fr')
    assert.equal(findEmailInText(cleaned), 'recrutement@acme.fr')
  })

  it('decodes percent-encoded and prose-obfuscated forms', () => {
    assert.equal(findEmailInText(normaliseObfuscation('contact%40acme.fr')), 'contact@acme.fr')
    assert.equal(findEmailInText(normaliseObfuscation('contact (at) acme.fr')), 'contact@acme.fr')
  })
})

describe('findEmailInText', () => {
  it('finds an address embedded in an offer body', () => {
    const body = 'Merci d adresser votre candidature a recrutement@acme.fr avant le 30 juin.'
    assert.equal(findEmailInText(body), 'recrutement@acme.fr')
  })

  it('returns null when the text has no address', () => {
    assert.equal(findEmailInText('Postulez directement sur notre site.'), null)
  })
})

describe('emailDomain', () => {
  it('extracts the domain of a valid address only', () => {
    assert.equal(emailDomain('contact@acme.fr'), 'acme.fr')
    assert.equal(emailDomain('noreply@acme.fr'), null)
  })
})
