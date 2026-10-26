import type { ApplicationSource, ApplicationStatus, Prisma } from '@prisma/client'
import { GraphQLError } from 'graphql'
import type { Context } from '@/context.js'
import { requireUser } from '@/lib/rbac.js'
import { env } from '@/config/env.js'
import { messages } from '@/constants/messages.js'
import { readCvBytes } from '@/lib/supabaseStorage.js'
import {
  buildApplicationEmail,
  createPrismaEmailStore,
  EmailSendError,
  resolveProvider,
  sendApplicationEmail,
} from '@/lib/email/index.js'
import { resolveAutomationSettings } from '@/lib/automation/constants.js'

// ─────────────────────────────────────────────────────────────────────────────
// Candidate applications read model + the candidate-triggered send.
//
// Reads are scoped to the signed-in candidate (`requireUser(ctx).id`): the owner
// predicate is part of every `where`, so one account's history can never surface in
// another's. The one mutation here — `sendMyApplication` — is the human-approval path
// of skill §8: the candidate explicitly sends a prepared automated application, and it
// is refused unless automation is switched on (approved behaviour, 2026-10).
// ─────────────────────────────────────────────────────────────────────────────

/** The row shape the view mapper needs — one application with its offer and email row. */
type ApplicationRow = Prisma.ApplicationGetPayload<{ include: { jobOffer: true; emailMessage: true } }>

/** Automated stages that still need the candidate's review — counted as "awaiting review". */
const REVIEWABLE_STAGES = ['PREPARING', 'READY_TO_SEND'] as const

export interface ApplicationDeliveryView {
  status: string
  provider: string | null
  sentAt: string | null
  deliveredAt: string | null
  bouncedAt: string | null
  repliedAt: string | null
  failedAt: string | null
}

export interface CandidateApplicationView {
  id: string
  source: string
  status: string
  stage: string | null
  matchScore: number | null
  jobTitle: string
  company: string | null
  location: string | null
  applyUrl: string | null
  hasEmail: boolean
  delivery: ApplicationDeliveryView | null
  createdAt: string
  sentAt: string | null
  updatedAt: string
}

export interface MyApplicationsFilter {
  source?: ApplicationSource | null
  status?: ApplicationStatus | null
}

/** Maps one persisted application row to the candidate-facing view (recipient address never leaks, §8). */
function toView(row: ApplicationRow): CandidateApplicationView {
  const email = row.emailMessage
  return {
    id: row.id,
    source: row.source,
    status: row.status,
    stage: row.stage ?? null,
    matchScore: row.matchScore,
    jobTitle: row.jobOffer?.title ?? 'Offre',
    company: row.jobOffer?.company ?? null,
    location: row.jobOffer?.location ?? null,
    applyUrl: row.jobOffer?.url ?? null,
    hasEmail: Boolean(email),
    delivery: email
      ? {
          status: email.deliveryStatus,
          // §8: the provider is safe to expose; the recipient address is not, so it is never mapped.
          provider: email.provider,
          sentAt: email.sentAt?.toISOString() ?? null,
          deliveredAt: email.deliveredAt?.toISOString() ?? null,
          bouncedAt: email.bouncedAt?.toISOString() ?? null,
          repliedAt: email.repliedAt?.toISOString() ?? null,
          failedAt: email.failedAt?.toISOString() ?? null,
        }
      : null,
    createdAt: row.createdAt.toISOString(),
    sentAt: row.sentAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
  }
}

/** The candidate's full application history, newest first, optionally narrowed by source/status. */
export async function getMyApplications(
  ctx: Context,
  filter?: MyApplicationsFilter,
): Promise<CandidateApplicationView[]> {
  const user = requireUser(ctx)
  const rows = await ctx.prisma.application.findMany({
    where: {
      userId: user.id,
      ...(filter?.source ? { source: filter.source } : {}),
      ...(filter?.status ? { status: filter.status } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: { jobOffer: true, emailMessage: true },
  })

  return rows.map(toView)
}

export interface CandidateApplicationStatsView {
  total: number
  manual: number
  automated: number
  sent: number
  pending: number
  interview: number
  rejected: number
  awaitingReview: number
  bestMatchScore: number | null
}

/** One pass over the candidate's applications to build the hub header counters. */
export async function getMyApplicationStats(ctx: Context): Promise<CandidateApplicationStatsView> {
  const user = requireUser(ctx)
  const rows = await ctx.prisma.application.findMany({
    where: { userId: user.id },
    select: { source: true, status: true, stage: true, matchScore: true },
  })

  const stats: CandidateApplicationStatsView = {
    total: rows.length,
    manual: 0,
    automated: 0,
    sent: 0,
    pending: 0,
    interview: 0,
    rejected: 0,
    awaitingReview: 0,
    bestMatchScore: null,
  }

  for (const row of rows) {
    if (row.source === 'AUTOMATED') stats.automated += 1
    else stats.manual += 1

    if (row.status === 'SENT') stats.sent += 1
    else if (row.status === 'PENDING') stats.pending += 1
    else if (row.status === 'INTERVIEW') stats.interview += 1
    else if (row.status === 'REJECTED') stats.rejected += 1

    if (row.source === 'AUTOMATED' && row.stage != null && REVIEWABLE_STAGES.includes(row.stage as never)) {
      stats.awaitingReview += 1
    }

    if (row.matchScore != null && (stats.bestMatchScore == null || row.matchScore > stats.bestMatchScore)) {
      stats.bestMatchScore = row.matchScore
    }
  }

  return stats
}

// ─────────────────────────────────────────────────────────────────────────────
// Candidate-triggered send (skill §8 — the human-approval path).
//
// The automation engine deliberately stops at preparation (stage READY_TO_SEND); it
// never delivers. The only way a prepared application leaves the building is this
// mutation: the candidate reviews it and presses "Send". Every guard below is a
// precondition for that one deliberate act.
//
// Point 4 of the approved model: no send is possible while the automation master
// switch is OFF — not even a per-offer one. The switch is consent; without it, this
// whole path is closed.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends one prepared automated application on the candidate's explicit request. Returns the
 * refreshed view on success; an already-sent application is returned unchanged (idempotent),
 * never re-delivered. Throws a typed {@link GraphQLError} when a precondition is unmet.
 */
export async function sendMyApplication(ctx: Context, applicationId: string): Promise<CandidateApplicationView> {
  const user = requireUser(ctx)

  // (1) Consent gate: the automation master switch must be ON. A disabled candidate can never
  //     trigger a send, per the approved model (point 4).
  const settingsRow = await ctx.prisma.candidateAutomationSettings.findUnique({
    where: { candidateId: user.id },
  })
  if (!resolveAutomationSettings(settingsRow).enabled) {
    throw new GraphQLError(messages.sendRequiresAutomationEnabled, { extensions: { code: 'FORBIDDEN' } })
  }

  // (2) Load the application scoped to its owner — a foreign id simply matches nothing.
  const application = await ctx.prisma.application.findFirst({
    where: { id: applicationId, userId: user.id, source: 'AUTOMATED' },
    include: { jobOffer: true, emailMessage: true },
  })
  if (!application) {
    throw new GraphQLError(messages.automationApplicationNotFound, { extensions: { code: 'NOT_FOUND' } })
  }

  // Idempotent short-circuit: a row already sent is returned as-is, never delivered twice.
  if (application.stage === 'SENT' || application.emailMessage?.deliveryStatus === 'SENT') {
    return toView(application)
  }

  // (3) Only a prepared, candidate-reviewable application is sendable.
  if (application.stage !== 'READY_TO_SEND') {
    throw new GraphQLError(messages.sendNotReady, { extensions: { code: 'BAD_USER_INPUT' } })
  }

  // (4) A verified recipient and a generated letter are produced during preparation; guard anyway
  //     so a half-prepared row can never reach a provider.
  const recipientEmail = application.recipientEmail?.trim()
  if (!recipientEmail) {
    throw new GraphQLError(messages.sendMissingContact, { extensions: { code: 'FAILED_PRECONDITION' } })
  }
  const coverLetter = application.coverLetter?.trim()
  if (!coverLetter) {
    throw new GraphQLError(messages.sendNotReady, { extensions: { code: 'FAILED_PRECONDITION' } })
  }

  // (5) Refuse honestly when no real send is possible rather than faking a SENT through the
  //     dry-run provider. resolveProvider(true) returns DRY_RUN unless a live send is both
  //     permitted (env) and configured (Brevo keys present).
  if (resolveProvider(true).id === 'DRY_RUN') {
    throw new GraphQLError(messages.sendDisabled, { extensions: { code: 'FAILED_PRECONDITION' } })
  }

  // (6) Candidate identity — the Reply-To and the signature. The candidate address is never a
  //     visible recipient and never the BCC (§8, approved email model).
  const profile = await ctx.prisma.profile.findUnique({ where: { userId: user.id } })
  const candidateName = [profile?.firstName, profile?.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ')
  const candidateEmail = user.email.trim()
  if (!candidateEmail) {
    throw new GraphQLError(messages.sendMissingIdentity, { extensions: { code: 'FAILED_PRECONDITION' } })
  }

  // (7) Latest CV bytes, read from hosted Supabase Storage (legacy local URLs still resolve).
  const cv = await ctx.prisma.cv.findFirst({
    where: { userId: user.id, pdfUrl: { not: null } },
    orderBy: { createdAt: 'desc' },
  })
  if (!cv?.pdfUrl) {
    throw new GraphQLError(messages.sendMissingCv, { extensions: { code: 'FAILED_PRECONDITION' } })
  }
  let cvContent: Buffer
  try {
    cvContent = await readCvBytes(cv.pdfUrl)
  } catch {
    throw new GraphQLError(messages.sendMissingCv, { extensions: { code: 'FAILED_PRECONDITION' } })
  }

  // (8) Compose the approved candidate-facing email. Throws (via buildCvAttachment) if the CV is
  //     not a plausible PDF, so a bad attachment fails here rather than in a recruiter's inbox.
  const email = buildApplicationEmail({
    recipientEmail,
    jobTitle: application.jobOffer?.title ?? 'candidature',
    candidateName,
    candidateEmail,
    candidatePhone: profile?.phone ?? null,
    coverLetter,
    cvContent,
    cvFilename: cv.fileName ?? undefined,
  })

  // (9) Send. The sender injects the server-owned From and the mandatory audit BCC, records
  //     SENDING → SENT/FAILED on the EmailMessage row, and dedups a crashed-and-resumed retry.
  let result
  try {
    result = await sendApplicationEmail(
      { applicationId: application.id, email, live: true },
      { store: createPrismaEmailStore(ctx), from: env.BREVO_SENDER_EMAIL },
    )
  } catch (err) {
    const code = err instanceof EmailSendError ? err.code : 'SERVER_ERROR'
    // Record the terminal reason on the row and leave an audit event; the delivery row is already
    // marked FAILED by the sender. No message body is ever persisted (§19).
    await ctx.prisma.application.update({
      where: { id: application.id },
      data: { skipReason: 'SEND_FAILED' },
    })
    await ctx.prisma.applicationEvent.create({
      data: { applicationId: application.id, type: 'SEND_FAILED', metadata: { code } },
    })
    throw new GraphQLError(messages.sendFailed, { extensions: { code: 'SEND_FAILED' } })
  }

  // (10) Promote the application to its terminal sent state and leave an audit trail. cvReference
  //      records which artifact was actually attached.
  const updated = await ctx.prisma.application.update({
    where: { id: application.id },
    data: {
      status: 'SENT',
      stage: 'SENT',
      sentAt: new Date(),
      cvReference: cv.pdfUrl,
    },
    include: { jobOffer: true, emailMessage: true },
  })
  await ctx.prisma.applicationEvent.create({
    data: {
      applicationId: application.id,
      type: 'SENT_BY_CANDIDATE',
      metadata: { provider: result.provider, deduplicated: result.deduplicated },
    },
  })

  return toView(updated)
}
