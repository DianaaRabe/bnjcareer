import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { MANDATORY_BCC } from '../constants.js'
import { sendApplicationEmail } from '../sender.js'
import type { EmailRecord, EmailStore } from '../store.js'
import {
  EmailSendError,
  type MailProvider,
  type OutgoingEmail,
  type ProviderSendInput,
  type SendResult,
} from '../types.js'

const email = (overrides: Partial<OutgoingEmail> = {}): OutgoingEmail => ({
  to: 'recrutement@acme.fr',
  subject: 'Candidature',
  text: 'Bonjour.',
  ...overrides,
})

/** Records every payload it is asked to send, so the BCC can be asserted after the fact. */
function recordingProvider(id: MailProvider['id'], result?: Partial<SendResult>): MailProvider & { sent: ProviderSendInput[] } {
  const sent: ProviderSendInput[] = []
  return {
    id,
    sent,
    isConfigured: () => true,
    async send(input) {
      sent.push(input)
      return { provider: id, providerMessageId: result?.providerMessageId ?? 'msg-1', ...result }
    },
  }
}

function throwingProvider(id: MailProvider['id'], error: EmailSendError): MailProvider {
  return {
    id,
    isConfigured: () => true,
    async send() {
      throw error
    },
  }
}

/** In-memory store standing in for Prisma. */
function fakeStore(initial?: EmailRecord): EmailStore & { record?: EmailRecord } {
  const state: { record?: EmailRecord } = { record: initial }
  return {
    get record() {
      return state.record
    },
    async find(applicationId) {
      return state.record?.applicationId === applicationId ? state.record : null
    },
    async markSending(applicationId) {
      const prev = state.record
      state.record = {
        applicationId,
        deliveryStatus: 'SENDING',
        attempts: (prev?.attempts ?? 0) + 1,
        providerMessageId: prev?.providerMessageId ?? null,
        providerThreadId: prev?.providerThreadId ?? null,
      }
    },
    async markSent(applicationId, r) {
      state.record = {
        applicationId,
        deliveryStatus: 'SENT',
        attempts: state.record?.attempts ?? 1,
        providerMessageId: r.providerMessageId,
        providerThreadId: r.providerThreadId ?? null,
      }
    },
    async markFailed(applicationId) {
      state.record = {
        applicationId,
        deliveryStatus: 'FAILED',
        attempts: state.record?.attempts ?? 1,
        providerMessageId: null,
        providerThreadId: null,
      }
    },
  }
}

describe('sendApplicationEmail — dry-run default', () => {
  it('uses the dry-run provider when live is not requested', async () => {
    const dryRun = recordingProvider('DRY_RUN')
    const result = await sendApplicationEmail(
      { applicationId: 'app-1', email: email() },
      { providers: { dryRun }, from: 'fanilo@bnjteammaker.fr' },
    )
    assert.equal(result.provider, 'DRY_RUN')
    assert.equal(dryRun.sent.length, 1)
  })

  it('the dry-run payload still carries the mandatory BCC', async () => {
    const dryRun = recordingProvider('DRY_RUN')
    await sendApplicationEmail(
      { applicationId: 'app-1', email: email() },
      { providers: { dryRun }, from: 'f@bnjteammaker.fr' },
    )
    assert.deepEqual(dryRun.sent[0].bcc, [MANDATORY_BCC])
  })

  it('never persists a delivery row for a dry run', async () => {
    const store = fakeStore()
    const dryRun = recordingProvider('DRY_RUN')
    await sendApplicationEmail(
      { applicationId: 'app-1', email: email() },
      { providers: { dryRun }, store, from: 'f@bnjteammaker.fr' },
    )
    assert.equal(store.record, undefined)
  })
})

describe('sendApplicationEmail — idempotency (skill §12)', () => {
  it('does not re-send an application already marked SENT', async () => {
    const live = recordingProvider('BREVO')
    const store = fakeStore({
      applicationId: 'app-1',
      deliveryStatus: 'SENT',
      attempts: 1,
      providerMessageId: 'brevo-xyz',
      providerThreadId: null,
    })
    // Force the real provider path so we can prove it is NOT called.
    const result = await sendApplicationEmail(
      { applicationId: 'app-1', email: email(), live: true },
      { providers: { live }, store, from: 'f@bnjteammaker.fr' },
    )
    assert.equal(result.deduplicated, true)
    assert.equal(result.providerMessageId, 'brevo-xyz')
    assert.equal(live.sent.length, 0)
  })

  it('passes the applicationId as the provider idempotency key', async () => {
    const dryRun = recordingProvider('DRY_RUN')
    await sendApplicationEmail(
      { applicationId: 'app-42', email: email() },
      { providers: { dryRun }, from: 'f@bnjteammaker.fr' },
    )
    assert.equal(dryRun.sent[0].idempotencyKey, 'app-42')
  })
})

describe('sendApplicationEmail — delivery state + failure', () => {
  it('records SENDING then SENT for a live provider', async () => {
    const live = recordingProvider('BREVO', { providerMessageId: 'brevo-ok', providerThreadId: 'thread-1' })
    const store = fakeStore()
    // `allowLiveSend: true` opens the env gate deterministically so the real-provider
    // (persistable) path runs — no process env, no dry-run fallback.
    const result = await sendApplicationEmail(
      { applicationId: 'app-1', email: email(), live: true },
      { providers: { live }, store, from: 'f@bnjteammaker.fr', allowLiveSend: true },
    )
    assert.equal(result.provider, 'BREVO')
    assert.equal(live.sent.length, 1)
    assert.equal(store.record?.deliveryStatus, 'SENT')
    assert.equal(store.record?.providerMessageId, 'brevo-ok')
    assert.equal(store.record?.providerThreadId, 'thread-1')
  })

  it('still injects the mandatory BCC on the live send path', async () => {
    const live = recordingProvider('BREVO')
    await sendApplicationEmail(
      { applicationId: 'app-1', email: email(), live: true },
      { providers: { live }, store: fakeStore(), from: 'f@bnjteammaker.fr', allowLiveSend: true },
    )
    assert.deepEqual(live.sent[0].bcc, [MANDATORY_BCC])
  })

  it('maps a provider EmailSendError and records FAILED', async () => {
    const failing = throwingProvider('BREVO', new EmailSendError('boom', 'SERVER_ERROR', false))
    const store = fakeStore()
    await assert.rejects(
      () =>
        sendApplicationEmail(
          { applicationId: 'app-1', email: email(), live: true },
          { providers: { live: failing }, store, from: 'f@bnjteammaker.fr', allowLiveSend: true },
        ),
      (err: unknown) => err instanceof EmailSendError && err.code === 'SERVER_ERROR',
    )
    assert.equal(store.record?.deliveryStatus, 'FAILED')
    assert.equal(store.record?.attempts, 1)
  })

  it('records FAILED when a persistable provider throws a retryable error', async () => {
    const failing = throwingProvider('BREVO', new EmailSendError('rate', 'RATE_LIMITED', true))
    const store = fakeStore()
    await assert.rejects(
      () =>
        sendApplicationEmail(
          { applicationId: 'app-1', email: email(), live: true },
          { providers: { live: failing }, store, from: 'f@bnjteammaker.fr', allowLiveSend: true },
        ),
      (err: unknown) => err instanceof EmailSendError && err.code === 'RATE_LIMITED',
    )
    assert.equal(store.record?.deliveryStatus, 'FAILED')
  })

  it('never persists a delivery row when the gate stays closed, even with live requested', async () => {
    const live = recordingProvider('BREVO')
    const store = fakeStore()
    // live: true but allowLiveSend omitted → env gate (closed in tests) → dry-run fallback.
    const result = await sendApplicationEmail(
      { applicationId: 'app-1', email: email(), live: true },
      { providers: { live }, store, from: 'f@bnjteammaker.fr' },
    )
    assert.equal(result.provider, 'DRY_RUN')
    assert.equal(live.sent.length, 0)
    assert.equal(store.record, undefined)
  })
})

describe('sendApplicationEmail — recipient validation', () => {
  it('throws INVALID_RECIPIENT before any provider call for a bad address', async () => {
    const dryRun = recordingProvider('DRY_RUN')
    await assert.rejects(
      () =>
        sendApplicationEmail(
          { applicationId: 'app-1', email: email({ to: 'noreply@acme.fr' }) },
          { providers: { dryRun }, from: 'f@bnjteammaker.fr' },
        ),
      (err: unknown) => err instanceof EmailSendError && err.code === 'INVALID_RECIPIENT',
    )
    assert.equal(dryRun.sent.length, 0)
  })
})
