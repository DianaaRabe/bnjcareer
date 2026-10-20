import { GraphQLError } from 'graphql'
import { z } from 'zod'
import type { AutomationFrequency } from '@prisma/client'
import type { Context } from '@/context.js'
import { messages } from '@/constants/messages.js'
import { requireUser } from '@/lib/rbac.js'
import {
  AUTOMATION_CEILINGS,
  AUTOMATION_DEFAULTS,
  nextRunAt,
  resolveAutomationSettings,
  runAutomationNowForCandidate,
  type AutomationSettingsResolved,
} from '@/lib/automation/index.js'

// ─────────────────────────────────────────────────────────────────────────────
// Candidate-facing automation service (skill §13–§16, §25).
//
// Everything here is scoped to the signed-in candidate (`requireUser(ctx).id`). A
// candidate can only ever read or mutate their own settings and their own prepared
// applications — the ownership predicate is part of every query's `where`, never a
// post-hoc check, so one account's data can never surface in another's.
// ─────────────────────────────────────────────────────────────────────────────

/** Stages a candidate can still cancel. Terminal stages (SENT/SENDING/CANCELLED) are excluded. */
const CANCELLABLE_STAGES = ['PREPARING', 'READY_TO_SEND', 'ELIGIBLE', 'MATCHED', 'DISCOVERED'] as const

/** Stages worth showing in the review list — work the candidate can act on. */
const REVIEWABLE_STAGES = ['PREPARING', 'READY_TO_SEND'] as const

export interface AutomationSettingsView extends AutomationSettingsResolved {
  nextRunAt: string | null
  ceilings: typeof AUTOMATION_CEILINGS
  defaults: typeof AUTOMATION_DEFAULTS
}

function toView(resolved: AutomationSettingsResolved, nextRunAtValue: Date | null): AutomationSettingsView {
  return {
    ...resolved,
    nextRunAt: nextRunAtValue ? nextRunAtValue.toISOString() : null,
    ceilings: AUTOMATION_CEILINGS,
    defaults: AUTOMATION_DEFAULTS,
  }
}

/** Load the row, resolve effective settings, and attach the server ceilings/defaults for the UI. */
export async function getMyAutomationSettings(ctx: Context): Promise<AutomationSettingsView> {
  const user = requireUser(ctx)
  const row = await ctx.prisma.candidateAutomationSettings.findUnique({
    where: { candidateId: user.id },
  })
  return toView(resolveAutomationSettings(row), row?.nextRunAt ?? null)
}

const updateSchema = z.object({
  frequency: z.enum(['DAILY', 'WEEKLY']).optional().nullable(),
  // Preferences are stored raw and clamped at read time by resolveAutomationSettings, so a value
  // above the ceiling is accepted here and simply has no effect — the candidate can never exceed it.
  maxApplicationsPerRun: z.number().int().min(1).max(1000).optional().nullable(),
  maxApplicationsPerDay: z.number().int().min(1).max(1000).optional().nullable(),
  minMatchScore: z.number().int().min(0).max(100).optional().nullable(),
  approvalMode: z.boolean().optional().nullable(),
  keywords: z.array(z.string().trim().min(1).max(100)).max(50).optional().nullable(),
  locations: z.array(z.string().trim().min(1).max(100)).max(50).optional().nullable(),
  contractTypes: z.array(z.string().trim().min(1).max(50)).max(20).optional().nullable(),
})

/**
 * Upsert the candidate's automation *preferences*. Deliberately never touches `enabled` or
 * `nextRunAt` — enabling is a separate, explicit action (skill §25), so saving preferences can
 * never silently turn automation on.
 */
export async function updateAutomationSettings(ctx: Context, input: unknown): Promise<AutomationSettingsView> {
  const user = requireUser(ctx)
  const parsed = updateSchema.safeParse(input)
  if (!parsed.success) {
    throw new GraphQLError(messages.automationSettingsInvalid, { extensions: { code: 'BAD_USER_INPUT' } })
  }

  const data = parsed.data
  // Only forward fields the caller actually sent (undefined = "leave unchanged").
  const writable = {
    ...(data.frequency != null ? { frequency: data.frequency as AutomationFrequency } : {}),
    ...(data.maxApplicationsPerRun !== undefined ? { maxApplicationsPerRun: data.maxApplicationsPerRun } : {}),
    ...(data.maxApplicationsPerDay !== undefined ? { maxApplicationsPerDay: data.maxApplicationsPerDay } : {}),
    ...(data.minMatchScore !== undefined ? { minMatchScore: data.minMatchScore } : {}),
    ...(data.approvalMode != null ? { approvalMode: data.approvalMode } : {}),
    ...(data.keywords != null ? { keywords: data.keywords } : {}),
    ...(data.locations != null ? { locations: data.locations } : {}),
    ...(data.contractTypes != null ? { contractTypes: data.contractTypes } : {}),
  }

  const row = await ctx.prisma.candidateAutomationSettings.upsert({
    where: { candidateId: user.id },
    // A fresh row is created disabled — saving preferences never implies consent.
    create: { candidateId: user.id, enabled: false, nextRunAt: null, ...writable },
    update: writable,
  })

  return toView(resolveAutomationSettings(row), row.nextRunAt ?? null)
}

/**
 * The explicit opt-in / opt-out (skill §25). Enabling schedules the first run immediately (due
 * now); disabling clears the schedule so the worker stops picking the candidate up.
 */
export async function setAutomationEnabled(ctx: Context, enabled: boolean): Promise<AutomationSettingsView> {
  const user = requireUser(ctx)
  const now = new Date()

  const existing = await ctx.prisma.candidateAutomationSettings.findUnique({
    where: { candidateId: user.id },
  })

  // On enable the first run is due immediately; disabling clears the schedule entirely.
  const next = enabled ? (existing?.nextRunAt ?? now) : null
  const frequency: AutomationFrequency = existing?.frequency ?? 'WEEKLY'

  const row = await ctx.prisma.candidateAutomationSettings.upsert({
    where: { candidateId: user.id },
    create: { candidateId: user.id, enabled, frequency, nextRunAt: enabled ? now : null },
    update: { enabled, nextRunAt: next },
  })

  return toView(resolveAutomationSettings(row), row.nextRunAt ?? null)
}

export interface AutomationRunSummaryView {
  id: string
  status: string
  startedAt: string
  completedAt: string | null
  jobsDiscovered: number
  jobsMatched: number
  applicationsPrepared: number
  failures: number
}

const MAX_RUNS = 20

export async function getMyAutomationRuns(ctx: Context, limit?: number | null): Promise<AutomationRunSummaryView[]> {
  const user = requireUser(ctx)
  const take = Math.min(Math.max(limit ?? 5, 1), MAX_RUNS)
  const rows = await ctx.prisma.automationRun.findMany({
    where: { candidateId: user.id },
    orderBy: { startedAt: 'desc' },
    take,
  })
  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    startedAt: row.startedAt.toISOString(),
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    jobsDiscovered: row.jobsDiscovered,
    jobsMatched: row.jobsMatched,
    // The column is named applicationsSent; until send is wired it records prepared counts.
    applicationsPrepared: row.applicationsSent,
    failures: row.failures,
  }))
}

export interface PreparedApplicationView {
  id: string
  stage: string
  matchScore: number | null
  jobTitle: string
  company: string | null
  location: string | null
  applyUrl: string | null
  hasContact: boolean
  recipientEmail: string | null
  coverLetter: string | null
  createdAt: string
}

export async function getMyPreparedApplications(ctx: Context): Promise<PreparedApplicationView[]> {
  const user = requireUser(ctx)
  const rows = await ctx.prisma.application.findMany({
    where: {
      userId: user.id,
      source: 'AUTOMATED',
      stage: { in: [...REVIEWABLE_STAGES] as never },
    },
    orderBy: { createdAt: 'desc' },
    include: { jobOffer: true },
  })

  return rows.map((row) => ({
    id: row.id,
    stage: (row.stage ?? 'PREPARING') as string,
    matchScore: row.matchScore,
    jobTitle: row.jobOffer?.title ?? 'Offre',
    company: row.jobOffer?.company ?? null,
    location: row.jobOffer?.location ?? null,
    applyUrl: row.jobOffer?.url ?? null,
    // §8: `hasContact` kept for back-compat, but the candidate reviewing their OWN prepared
    // application may see the resolved recipient — they are the one deciding whether to send.
    hasContact: Boolean(row.recipientEmail),
    recipientEmail: row.recipientEmail ?? null,
    coverLetter: row.coverLetter,
    createdAt: row.createdAt.toISOString(),
  }))
}

/**
 * Cancel a prepared application. The candidate id is part of the `where`, so a candidate can only
 * cancel their own rows — a foreign id matches zero rows and is reported as not-found.
 */
export async function cancelPreparedApplication(ctx: Context, id: string): Promise<boolean> {
  const user = requireUser(ctx)

  const result = await ctx.prisma.application.updateMany({
    where: {
      id,
      userId: user.id,
      source: 'AUTOMATED',
      stage: { in: [...CANCELLABLE_STAGES] as never },
    },
    data: { stage: 'CANCELLED' as never, skipReason: 'SKIPPED' as never },
  })

  if (result.count === 0) {
    throw new GraphQLError(messages.automationApplicationNotFound, { extensions: { code: 'NOT_FOUND' } })
  }

  await ctx.prisma.applicationEvent.create({
    data: { applicationId: id, type: 'CANCELLED_BY_CANDIDATE' },
  })
  return true
}

/**
 * Triggers an immediate automation pipeline run on demand for the candidate.
 */
export async function triggerMyAutomationRun(ctx: Context): Promise<AutomationRunSummaryView> {
  const user = requireUser(ctx)
  const result = await runAutomationNowForCandidate(ctx, user.id)

  const row = await ctx.prisma.automationRun.findUnique({
    where: { id: result.runId },
  })

  if (!row) {
    throw new GraphQLError('Erreur lors de la récupération du rapport d\'analyse', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    })
  }

  return {
    id: row.id,
    status: row.status,
    startedAt: row.startedAt.toISOString(),
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    jobsDiscovered: row.jobsDiscovered,
    jobsMatched: row.jobsMatched,
    applicationsPrepared: row.applicationsSent,
    failures: row.failures,
  }
}

