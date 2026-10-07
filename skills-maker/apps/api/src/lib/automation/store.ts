// ─────────────────────────────────────────────────────────────────────────────
// Persistence port for the application engine.
//
// The engine depends on this narrow interface rather than on Prisma directly, for
// two reasons: the pipeline can then be tested without a database, and every write
// that touches candidate data passes through one auditable place. The Prisma
// implementation is the only file here that knows about tables.
// ─────────────────────────────────────────────────────────────────────────────

import { Prisma } from '@prisma/client'
import type { Context } from '@/context.js'
import type { ContactCandidate, ContactConfidence, ContactSource } from '@/lib/enrichment/types.js'
import type { CanonicalJob } from './types.js'

export interface AppliedRecord {
  applicationId: string
  stage: string | null
}

export interface SavePreparedInput {
  candidateId: string
  job: CanonicalJob
  matchScore: number
  contact: ContactCandidate | null
  coverLetter: string | null
  coverLetterModel: string | null
  /** Lifecycle stage the row starts in — READY_TO_SEND under approval, PREPARING otherwise. */
  stage: string
  /** Provider-scoped run id, kept on the audit event rather than on the row. */
  runId?: string | null
}

export interface SavePreparedResult {
  applicationId: string
  jobOfferId: string
  /** False when the unique (candidate, vacancy) constraint was already satisfied. */
  created: boolean
}

export interface AutomationStore {
  /** candidate-scoped already-applied lookup, keyed by canonical vacancy key. */
  findApplied(candidateId: string, canonicalKeys: string[]): Promise<Map<string, AppliedRecord>>
  /** Automated applications prepared for this candidate since `since`, for the daily budget. */
  countPreparedSince(candidateId: string, since: Date): Promise<number>
  savePrepared(input: SavePreparedInput): Promise<SavePreparedResult>
  saveContact(jobOfferId: string, contact: ContactCandidate): Promise<void>
  recordEvent(applicationId: string, type: string, metadata?: Record<string, unknown>): Promise<void>
}

/** No-op store — the default for dry runs where nothing must be written. */
export const nullAutomationStore: AutomationStore = {
  async findApplied() {
    return new Map()
  },
  async countPreparedSince() {
    return 0
  },
  async savePrepared() {
    throw new Error('nullAutomationStore cannot persist a prepared application')
  },
  async saveContact() {},
  async recordEvent() {},
}

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function createPrismaAutomationStore(ctx: Context): AutomationStore {
  const prisma = ctx.prisma

  return {
    async findApplied(candidateId, canonicalKeys) {
      const applied = new Map<string, AppliedRecord>()
      if (canonicalKeys.length === 0) return applied

      const rows = await prisma.application.findMany({
        where: {
          userId: candidateId,
          jobOffer: { canonicalKey: { in: canonicalKeys } },
        },
        select: { id: true, stage: true, jobOffer: { select: { canonicalKey: true } } },
      })

      for (const row of rows) {
        const key = row.jobOffer?.canonicalKey
        if (key) applied.set(key, { applicationId: row.id, stage: row.stage })
      }
      return applied
    },

    async countPreparedSince(candidateId, since) {
      return prisma.application.count({
        where: {
          userId: candidateId,
          source: 'AUTOMATED',
          createdAt: { gte: since },
          // A cancelled preparation never consumed a sending slot.
          stage: { not: 'CANCELLED' },
        },
      })
    },

    async savePrepared(input) {
      const { job } = input

      // The vacancy is shared across candidates, so it is upserted on its canonical key and
      // never overwritten: the first normalisation of an offer wins, and later runs reuse it.
      const jobOffer = await prisma.jobOffer.upsert({
        where: { canonicalKey: job.canonicalKey },
        create: {
          canonicalKey: job.canonicalKey,
          externalId: job.externalId ?? null,
          title: job.title,
          company: job.company,
          description: job.description || null,
          source: job.source,
          url: job.applyUrl || null,
          companyWebsite: job.companyWebsite ?? null,
          location: job.location || null,
          remote: job.isRemote,
          tags: job.tags,
          publishedAt: toDate(job.postedAt),
          discoveredAt: toDate(job.discoveredAt),
          rawSourceReference: job.rawSourceReference ?? null,
        },
        update: {},
      })

      try {
        const application = await prisma.application.create({
          data: {
            userId: input.candidateId,
            jobOfferId: jobOffer.id,
            status: 'PENDING',
            matchScore: input.matchScore,
            source: 'AUTOMATED',
            stage: input.stage as never,
            recipientEmail: input.contact?.email ?? null,
            coverLetter: input.coverLetter,
            coverLetterModel: input.coverLetterModel,
          },
        })
        return { applicationId: application.id, jobOfferId: jobOffer.id, created: true }
      } catch (err) {
        // (userId, jobOfferId) is unique — the §6 idempotency guarantee. A concurrent run that
        // won the race means this vacancy is already applied to; reuse its row instead of failing.
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          const existing = await prisma.application.findFirst({
            where: { userId: input.candidateId, jobOfferId: jobOffer.id },
          })
          if (existing) return { applicationId: existing.id, jobOfferId: jobOffer.id, created: false }
        }
        throw err
      }
    },

    async saveContact(jobOfferId, contact) {
      await prisma.jobContact.upsert({
        where: { jobId_email: { jobId: jobOfferId, email: contact.email } },
        create: {
          jobId: jobOfferId,
          email: contact.email,
          contactName: contact.contactName,
          source: contact.source as ContactSource as never,
          confidence: contact.confidence as ContactConfidence as never,
          verifiedAt: contact.confidence === 'VERIFIED' ? new Date() : null,
        },
        // A previously guessed address that has now been confirmed at its source is upgraded.
        update:
          contact.confidence === 'VERIFIED'
            ? { confidence: 'VERIFIED', verifiedAt: new Date() }
            : {},
      })
    },

    async recordEvent(applicationId, type, metadata) {
      await prisma.applicationEvent.create({
        data: { applicationId, type, metadata: (metadata ?? undefined) as never },
      })
    },
  }
}
