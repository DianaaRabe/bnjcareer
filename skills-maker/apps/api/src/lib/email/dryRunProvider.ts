// ─────────────────────────────────────────────────────────────────────────────
// Dry-run provider — the default (skill §34.11: "do not send real emails during
// development unless explicitly instructed").
//
// It performs the exact same BCC assertion a real provider does, then returns a
// synthetic message id WITHOUT any network call. This is what makes the whole pipeline
// runnable and testable end to end with no risk of a real send, and it keeps the
// mandatory-BCC guarantee on the no-send path too.
// ─────────────────────────────────────────────────────────────────────────────

import { randomUUID } from 'node:crypto'
import { assertMandatoryBcc } from './buildMessage.js'
import type { MailProvider, ProviderSendInput, SendResult } from './types.js'

export function createDryRunProvider(): MailProvider {
  return {
    id: 'DRY_RUN',
    isConfigured() {
      return true
    },
    async send(input: ProviderSendInput): Promise<SendResult> {
      // Same contract as a live provider: a payload missing the BCC is refused even here.
      assertMandatoryBcc(input)
      return {
        provider: 'DRY_RUN',
        providerMessageId: `dry-run:${input.idempotencyKey ?? randomUUID()}`,
      }
    },
  }
}
