import { timingSafeEqual } from 'node:crypto'
import { Router } from 'express'
import { env } from '@/config/env.js'
import { prisma } from '@/lib/prisma.js'
import type { Context } from '@/context.js'
import { createSchedulerDeps, runDueAutomations } from '@/lib/automation/index.js'

// ─────────────────────────────────────────────────────────────────────────────
// Internal automation-cron trigger (skill §17).
//
// This is an admin/worker seam, not a candidate route. An external scheduler (cron,
// a platform job runner) POSTs here on an interval; the handler drains one batch of
// due candidates through the scheduler. Three safety properties the skill demands:
//
//   • Default-closed. With AUTOMATION_CRON_SECRET unset the route refuses *every*
//     request (503), so automation cannot be driven in an environment that did not
//     explicitly opt in. There is no implicit "allow in dev" path.
//   • Secret-gated with a timing-safe compare. The shared secret travels in a header,
//     never a query string (skill §27 / privacy), and the comparison does not leak
//     length or prefix through timing.
//   • Redacted response. Only aggregate counts leave the process — never candidate
//     ids, offer text, or per-source detail (skill §27).
// ─────────────────────────────────────────────────────────────────────────────

/** Constant-time string compare that never throws and treats length mismatch as "no match". */
function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  // timingSafeEqual requires equal-length buffers; comparing against a fixed-length copy of
  // `a` keeps the work constant regardless of whether the lengths matched.
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA)
    return false
  }
  return timingSafeEqual(bufA, bufB)
}

export const automationCronRouter = Router()

automationCronRouter.post('/automation/run', async (req, res) => {
  const secret = env.AUTOMATION_CRON_SECRET.trim()
  if (!secret) {
    res.status(503).json({ error: 'automation cron not configured' })
    return
  }

  const provided = req.headers['x-automation-secret']
  if (typeof provided !== 'string' || !timingSafeEqualStr(provided, secret)) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }

  const ctx: Context = { prisma, user: null, audit: { ipAddress: null, userAgent: null } }

  try {
    const summary = await runDueAutomations(createSchedulerDeps(ctx))
    // Aggregate counts only — no candidate ids or per-source detail (skill §27).
    res.json({
      processed: summary.processed,
      claimed: summary.claimed,
      skippedLocked: summary.skippedLocked,
    })
  } catch (error) {
    // The batch coordinator confines per-candidate failures itself; reaching here means an
    // infrastructural fault (e.g. the store's findDueCandidates threw). Never echo the detail.
    console.error('[automation-cron] batch failed:', error)
    res.status(500).json({ error: 'automation batch failed' })
  }
})
