import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { assertMandatoryBcc, buildProviderInput } from '../buildMessage.js'
import { MANDATORY_BCC } from '../constants.js'
import { EmailSendError, type OutgoingEmail, type ProviderSendInput } from '../types.js'

const email = (overrides: Partial<OutgoingEmail> = {}): OutgoingEmail => ({
  to: 'recrutement@acme.fr',
  subject: 'Candidature — Data Analyst',
  text: 'Bonjour, veuillez trouver ma candidature.',
  ...overrides,
})

describe('buildProviderInput — mandatory BCC (skill §11)', () => {
  it('always injects the mandatory BCC', () => {
    const input = buildProviderInput(email(), { from: 'fanilo@bnjteammaker.fr' })
    assert.deepEqual(input.bcc, [MANDATORY_BCC])
  })

  it('ignores any bcc a caller smuggles in via an untyped object', () => {
    // Simulate a frontend-originated payload trying to override or remove the BCC.
    const hostile = { ...email(), bcc: ['attacker@evil.com'] } as unknown as OutgoingEmail
    const input = buildProviderInput(hostile, { from: 'fanilo@bnjteammaker.fr' })
    assert.deepEqual(input.bcc, [MANDATORY_BCC])
    assert.ok(!input.bcc.includes('attacker@evil.com'))
  })

  it('never exposes the BCC as the visible recipient', () => {
    assert.throws(
      () => buildProviderInput(email({ to: MANDATORY_BCC }), { from: 'f@bnjteammaker.fr' }),
      (err: unknown) => err instanceof EmailSendError && err.code === 'INVALID_RECIPIENT',
    )
  })

  it('rejects an unsuitable recipient (noreply)', () => {
    assert.throws(
      () => buildProviderInput(email({ to: 'noreply@acme.fr' }), { from: 'f@bnjteammaker.fr' }),
      (err: unknown) => err instanceof EmailSendError && err.code === 'INVALID_RECIPIENT',
    )
  })

  it('defaults replyTo to the sender when none is given', () => {
    const input = buildProviderInput(email(), { from: 'fanilo@bnjteammaker.fr' })
    assert.equal(input.replyTo, 'fanilo@bnjteammaker.fr')
  })

  it('threads the idempotency key through', () => {
    const input = buildProviderInput(email(), { from: 'f@bnjteammaker.fr', idempotencyKey: 'app-123' })
    assert.equal(input.idempotencyKey, 'app-123')
  })
})

describe('assertMandatoryBcc', () => {
  it('passes when the BCC is present', () => {
    const input = { bcc: [MANDATORY_BCC] } as ProviderSendInput
    assert.doesNotThrow(() => assertMandatoryBcc(input))
  })

  it('throws when the BCC is missing', () => {
    const input = { bcc: ['someone@else.com'] } as ProviderSendInput
    assert.throws(() => assertMandatoryBcc(input), (err: unknown) => err instanceof EmailSendError)
  })

  it('is case-insensitive about the BCC address', () => {
    const input = { bcc: [MANDATORY_BCC.toUpperCase()] } as ProviderSendInput
    assert.doesNotThrow(() => assertMandatoryBcc(input))
  })
})
