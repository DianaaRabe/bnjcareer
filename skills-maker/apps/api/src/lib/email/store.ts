// ─────────────────────────────────────────────────────────────────────────────
// Delivery-state persistence port for the email sender.
//
// One `EmailMessage` row per application (the table enforces `@@unique(applicationId)`),
// so a retry updates the same row and increments `attempts` rather than inserting a
// duplicate — the storage half of the "avoid duplicate sends" rule (§12). The sender
// depends on this narrow port, never on Prisma, so it stays unit-testable.
// ─────────────────────────────────────────────────────────────────────────────

import type { Context } from '@/context.js'
import type { EmailProviderName } from './types.js'

/** Provider names that map onto the Prisma `EmailProvider` enum (DRY_RUN does not persist as a real send). */
type PersistableProvider = Exclude<EmailProviderName, 'DRY_RUN'>

export interface EmailRecord {
  applicationId: string
  deliveryStatus: string
  attempts: number
  providerMessageId: string | null
  providerThreadId: string | null
}

export interface EmailStore {
  /** Returns the existing row for an application, or null if none has been created yet. */
  find(applicationId: string): Promise<EmailRecord | null>
  /** Creates (or returns) the QUEUED row and marks it SENDING with an incremented attempt. */
  markSending(applicationId: string, provider: PersistableProvider): Promise<void>
  markSent(
    applicationId: string,
    result: { providerMessageId: string; providerThreadId?: string },
  ): Promise<void>
  markFailed(applicationId: string, failureCode: string): Promise<void>
}

/** No-op store for dry runs and tests where no delivery row must be written. */
export const nullEmailStore: EmailStore = {
  async find() {
    return null
  },
  async markSending() {},
  async markSent() {},
  async markFailed() {},
}

export function createPrismaEmailStore(ctx: Context): EmailStore {
  const prisma = ctx.prisma

  return {
    async find(applicationId) {
      const row = await prisma.emailMessage.findUnique({ where: { applicationId } })
      if (!row) return null
      return {
        applicationId: row.applicationId,
        deliveryStatus: row.deliveryStatus,
        attempts: row.attempts,
        providerMessageId: row.providerMessageId,
        providerThreadId: row.providerThreadId,
      }
    },

    async markSending(applicationId, provider) {
      await prisma.emailMessage.upsert({
        where: { applicationId },
        create: {
          applicationId,
          provider: provider as never,
          deliveryStatus: 'SENDING',
          attempts: 1,
        },
        update: {
          provider: provider as never,
          deliveryStatus: 'SENDING',
          attempts: { increment: 1 },
        },
      })
    },

    async markSent(applicationId, result) {
      await prisma.emailMessage.update({
        where: { applicationId },
        data: {
          deliveryStatus: 'SENT',
          providerMessageId: result.providerMessageId,
          providerThreadId: result.providerThreadId ?? null,
          sentAt: new Date(),
          failureCode: null,
        },
      })
    },

    async markFailed(applicationId, failureCode) {
      await prisma.emailMessage.update({
        where: { applicationId },
        data: { deliveryStatus: 'FAILED', failedAt: new Date(), failureCode },
      })
    },
  }
}
