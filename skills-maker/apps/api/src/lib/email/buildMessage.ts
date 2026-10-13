// ─────────────────────────────────────────────────────────────────────────────
// Server-side message assembly and BCC enforcement (skill §11).
//
// This is the single place an `OutgoingEmail` becomes a `ProviderSendInput`. It is the
// only function that writes the `bcc` array, and it always writes exactly the mandatory
// address — a caller cannot add to it, override it or remove it, because the input type
// has no `bcc` field at all. The BCC is also kept out of the visible `To` so it is never
// exposed to the candidate as if it were the recipient.
// ─────────────────────────────────────────────────────────────────────────────

import { isApplicationEmail } from '@/lib/enrichment/emailAddresses.js'
import { MANDATORY_BCC } from './constants.js'
import { EmailSendError, type OutgoingEmail, type ProviderSendInput } from './types.js'

export interface BuildMessageOptions {
  from: string
  idempotencyKey?: string
}

/**
 * Turns a caller's `OutgoingEmail` into the exact payload a provider sends.
 *
 * Guarantees, each asserted by a test:
 *  - `bcc` contains {@link MANDATORY_BCC} and nothing a request could have injected.
 *  - the recipient is a real, application-suitable address (no noreply/dpo, no asset URL).
 *  - the mandatory BCC never leaks into `to`.
 */
export function buildProviderInput(email: OutgoingEmail, options: BuildMessageOptions): ProviderSendInput {
  const to = email.to.trim().toLowerCase()

  if (!isApplicationEmail(to)) {
    throw new EmailSendError(`Refusing to send to an unsuitable recipient`, 'INVALID_RECIPIENT', false)
  }
  if (to === MANDATORY_BCC.toLowerCase()) {
    // The audit address must never be addressed as the visible recipient.
    throw new EmailSendError('Recipient may not be the mandatory BCC address', 'INVALID_RECIPIENT', false)
  }

  return {
    to,
    subject: email.subject,
    text: email.text,
    html: email.html,
    attachments: email.attachments,
    replyTo: email.replyTo ?? options.from,
    from: options.from,
    // The one and only writer of this field. Not spread from input — input has no bcc.
    bcc: [MANDATORY_BCC],
    idempotencyKey: options.idempotencyKey,
  }
}

/**
 * Last-line defence used by every provider just before it hits the wire: proves the
 * mandatory BCC is present and that no request path removed it. A provider that is handed
 * a payload without it throws rather than sending a non-compliant email.
 */
export function assertMandatoryBcc(input: ProviderSendInput): void {
  const present = input.bcc.some((addr) => addr.trim().toLowerCase() === MANDATORY_BCC.toLowerCase())
  if (!present) {
    throw new EmailSendError('Mandatory BCC missing — refusing to send', 'SERVER_ERROR', false)
  }
}
