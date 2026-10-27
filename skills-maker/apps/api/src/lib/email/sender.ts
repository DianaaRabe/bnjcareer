// ─────────────────────────────────────────────────────────────────────────────
// Application-email sender (skill §12).
//
// The one orchestration every send goes through. It:
//   1. resolves a provider — dry-run UNLESS a live send is both requested and permitted;
//   2. short-circuits if this application was already sent (provider message id present),
//      so a re-run never double-delivers;
//   3. builds the payload via `buildProviderInput`, which injects the mandatory BCC;
//   4. records SENDING → SENT / FAILED through the store port.
//
// Dry-run is the default and the only mode reachable without BOTH `EMAIL_SEND_LIVE=true`
// in the environment AND an explicit `live: true` at the call site — two independent
// switches, neither of which a request body can set.
// ─────────────────────────────────────────────────────────────────────────────

import { env } from '@/config/env.js'
import { buildProviderInput } from './buildMessage.js'
import { createBrevoProvider } from './brevoProvider.js'
import { createDryRunProvider } from './dryRunProvider.js'
import { nullEmailStore, type EmailStore } from './store.js'
import { EmailSendError, type MailProvider, type OutgoingEmail, type SendResult } from './types.js'

/**
 * The `From` header: the configured address, prefixed with the optional display name.
 * `BREVO_SENDER_NAME` exists because an env value containing `<…>` is routinely mangled by
 * shells and dashboards, so the two parts are configured separately.
 */
function defaultSender(): string {
  const email = env.BREVO_SENDER_EMAIL.trim()
  const name = env.BREVO_SENDER_NAME.trim()
  if (!email || !name || email.includes('<')) return email
  return `${name} <${email}>`
}

/** Whether the environment permits any real send at all. Defaults closed. */
export function liveSendAllowed(): boolean {
  return env.EMAIL_SEND_LIVE.trim().toLowerCase() === 'true'
}

/**
 * Chooses the provider for a send. A real provider is used only when a live send is
 * requested AND the environment allows it AND the provider is configured. Any failure of
 * those conditions returns the dry-run provider — the safe default.
 *
 * `allowLive` defaults to the environment gate {@link liveSendAllowed}; it is a seam so a
 * test can exercise the persistable (real-provider) path deterministically without ever
 * relying on process env. It defaults closed, so production behaviour is unchanged.
 */
export function resolveProvider(
  live: boolean,
  overrides?: { live?: MailProvider; dryRun?: MailProvider },
  allowLive: boolean = liveSendAllowed(),
): MailProvider {
  const dryRun = overrides?.dryRun ?? createDryRunProvider()
  if (!live || !allowLive) return dryRun
  const real = overrides?.live ?? createBrevoProvider()
  return real.isConfigured() ? real : dryRun
}

export interface SendApplicationInput {
  /** Drives idempotency and the delivery row. */
  applicationId: string
  email: OutgoingEmail
  /** Opt-in to a real send. Still gated by {@link liveSendAllowed} and provider config. */
  live?: boolean
}

export interface SendApplicationDeps {
  store?: EmailStore
  /** Test seam — inject fake providers without touching env. */
  providers?: { live?: MailProvider; dryRun?: MailProvider }
  /** Resolved sender address. Defaults to the configured Brevo sender. */
  from?: string
  /**
   * Test seam — overrides the environment live-send gate. Defaults closed to
   * {@link liveSendAllowed}, so production is never affected. Lets a test drive the
   * persistable (real-provider) path without setting process env.
   */
  allowLiveSend?: boolean
}

export interface SendApplicationResult extends SendResult {
  /** True when the send was skipped because the application was already delivered. */
  deduplicated: boolean
}

/**
 * Sends one application email. Throws {@link EmailSendError} on a terminal failure after
 * recording FAILED; the provider's own retry/backoff has already run by then.
 */
export async function sendApplicationEmail(
  input: SendApplicationInput,
  deps: SendApplicationDeps = {},
): Promise<SendApplicationResult> {
  const store = deps.store ?? nullEmailStore
  const provider = resolveProvider(input.live ?? false, deps.providers, deps.allowLiveSend)

  // Idempotency: an application already carrying a provider message id was sent — do not
  // send again. This is what makes a crashed-and-resumed worker safe (§12).
  const existing = await store.find(input.applicationId)
  if (existing?.providerMessageId && existing.deliveryStatus === 'SENT') {
    return {
      provider: provider.id,
      providerMessageId: existing.providerMessageId,
      providerThreadId: existing.providerThreadId ?? undefined,
      deduplicated: true,
    }
  }

  const from = (deps.from ?? defaultSender()).trim()
  if (!from) {
    throw new EmailSendError('No sender address configured', 'NOT_CONFIGURED', false)
  }

  const payload = buildProviderInput(input.email, { from, idempotencyKey: input.applicationId })

  // DRY_RUN never persists as a real delivery; only a real provider updates the row.
  const persistable = provider.id !== 'DRY_RUN'
  if (persistable) await store.markSending(input.applicationId, provider.id as never)

  try {
    const result = await provider.send(payload)
    if (persistable) {
      await store.markSent(input.applicationId, {
        providerMessageId: result.providerMessageId,
        providerThreadId: result.providerThreadId,
      })
    }
    return { ...result, deduplicated: false }
  } catch (err) {
    const code = err instanceof EmailSendError ? err.code : 'SERVER_ERROR'
    if (persistable) await store.markFailed(input.applicationId, code)
    throw err
  }
}
