import type { ApplicationStatus } from '@prisma/client'
import type { Context } from '@/context.js'

/** Minimal offer shape either the matching flow or the apply flow can produce. */
export type TrackedOfferInput = {
  title: string
  company?: string | null
  description?: string | null
  source?: string | null
  url?: string | null
}

/**
 * Persists (or promotes) a candidate's application to an offer so the dashboard and the
 * coaching journey reflect real actions. Deduplicates by offer identity — the offer URL when
 * present, otherwise title + company — so "analyse de matching" then "postuler" on the same
 * offer updates a single row instead of inflating the counters.
 */
export async function recordApplication(
  ctx: Context,
  offer: TrackedOfferInput,
  opts: { status: ApplicationStatus; matchScore?: number | null },
) {
  const userId = ctx.user!.id
  const title = offer.title.trim() || 'Offre'
  const company = offer.company?.trim() || null
  const url = offer.url?.trim() || null

  const existing = await ctx.prisma.application.findFirst({
    where: {
      userId,
      jobOffer: url ? { url } : { title, company },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (existing) {
    // Never downgrade a SENT application back to PENDING, but always refresh the best score.
    const keepStatus = existing.status === 'SENT' && opts.status === 'PENDING'
    return ctx.prisma.application.update({
      where: { id: existing.id },
      data: {
        status: keepStatus ? existing.status : opts.status,
        matchScore: opts.matchScore ?? existing.matchScore,
      },
    })
  }

  const jobOffer = await ctx.prisma.jobOffer.create({
    data: {
      title,
      company,
      description: offer.description?.trim() || null,
      source: offer.source?.trim() || null,
      url,
    },
  })

  return ctx.prisma.application.create({
    data: {
      userId,
      jobOfferId: jobOffer.id,
      status: opts.status,
      matchScore: opts.matchScore ?? null,
    },
  })
}

/** Attaches (or refreshes) the AI match analysis tied to an application. */
export async function recordMatchAnalysis(
  ctx: Context,
  applicationId: string,
  data: { score: number; gaps: unknown; suggestions: unknown },
) {
  return ctx.prisma.matchAnalysis.upsert({
    where: { applicationId },
    create: {
      applicationId,
      score: data.score,
      gaps: data.gaps as never,
      suggestions: data.suggestions as never,
    },
    update: {
      score: data.score,
      gaps: data.gaps as never,
      suggestions: data.suggestions as never,
    },
  })
}
