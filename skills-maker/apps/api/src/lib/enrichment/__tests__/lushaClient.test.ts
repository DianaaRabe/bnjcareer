import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { __testing as clientTesting } from '../lushaClient.js'
import { __testing as enricherTesting } from '../lushaEnricher.js'

const { classify } = clientTesting
const { hasRevealableEmail, pickBestEmail } = enricherTesting

describe('Lusha error classification', () => {
  it('treats rate limiting and server errors as retryable', () => {
    assert.equal(classify(429, '{}').retryable, true)
    assert.equal(classify(429, '{}').code, 'RATE_LIMITED')
    assert.equal(classify(500, '{}').retryable, true)
    assert.equal(classify(503, '{}').retryable, true)
    assert.equal(classify(499, '{}').retryable, true)
  })

  it('treats authorisation and credit failures as permanent', () => {
    assert.equal(classify(401, '{}').code, 'UNAUTHORIZED')
    assert.equal(classify(401, '{}').retryable, false)
    assert.equal(classify(402, '{}').code, 'OUT_OF_CREDITS')
    assert.equal(classify(402, '{}').retryable, false)
    assert.equal(classify(403, '{}').code, 'ACCOUNT_INACTIVE')
  })

  it('never retries a GDPR refusal', () => {
    // 451 is a legal block, not a transient failure — retrying would just burn requests.
    const error = classify(451, '{}')
    assert.equal(error.code, 'GDPR_BLOCKED')
    assert.equal(error.retryable, false)
  })

  it('surfaces the provider message without leaking the key', () => {
    const error = classify(400, JSON.stringify({ statusCode: 400, message: 'Invalid request parameters' }))
    assert.ok(error.message.includes('Invalid request parameters'))
  })

  it('tolerates a non-JSON error body', () => {
    const error = classify(500, '<html>gateway error</html>')
    assert.equal(error.code, 'SERVER_ERROR')
    assert.ok(error.message.includes('gateway error'))
  })
})

describe('pickBestEmail', () => {
  it('prefers the highest confidence grade', () => {
    assert.equal(
      pickBestEmail([
        { email: 'a@acme.fr', confidence: 'B' },
        { email: 'b@acme.fr', confidence: 'A+' },
      ]),
      'b@acme.fr',
    )
  })

  it('lowercases the result and tolerates missing entries', () => {
    assert.equal(pickBestEmail([{ email: 'Contact@ACME.FR' }]), 'contact@acme.fr')
    assert.equal(pickBestEmail([{}, { email: undefined }]), null)
  })

  it('ranks a graded address above an ungraded one', () => {
    assert.equal(pickBestEmail([{ email: 'x@acme.fr' }, { email: 'y@acme.fr', confidence: 'C' }]), 'y@acme.fr')
  })

  it('returns null when no email was revealed', () => {
    assert.equal(pickBestEmail([]), null)
    assert.equal(pickBestEmail(undefined), null)
  })
})

describe('hasRevealableEmail', () => {
  it('accepts a preview that reports a revealable email', () => {
    assert.equal(hasRevealableEmail({ id: '1', canReveal: [{ field: 'emails', credits: 1 }] }), true)
  })

  it('accepts an already-revealed email, which costs nothing', () => {
    assert.equal(hasRevealableEmail({ id: '1', canReveal: [{ field: 'emails', credits: 0 }] }), true)
  })

  it('rejects a preview with no email to reveal, so no credits are spent on it', () => {
    assert.equal(hasRevealableEmail({ id: '1', canReveal: [{ field: 'phones', credits: 5 }] }), false)
    assert.equal(hasRevealableEmail({ id: '1' }), false)
  })

  it('rejects an errored lookup and a preview without an id', () => {
    assert.equal(hasRevealableEmail({ id: '1', error: { code: 'NOT_FOUND', message: 'nope' } }), false)
    assert.equal(hasRevealableEmail({ canReveal: [{ field: 'emails', credits: 1 }] }), false)
  })
})
