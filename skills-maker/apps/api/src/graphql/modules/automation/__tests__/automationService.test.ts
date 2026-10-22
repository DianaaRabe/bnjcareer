import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Context } from '@/context.js'
import { AUTOMATION_CEILINGS, AUTOMATION_DEFAULTS } from '@/lib/automation/index.js'
import {
  cancelPreparedApplication,
  getMyAutomationRuns,
  getMyAutomationSettings,
  getMyPreparedApplications,
  setAutomationEnabled,
  updateAutomationSettings,
} from '../automationService.js'

// ─────────────────────────────────────────────────────────────────────────────
// A minimal in-memory Prisma double. Each delegate records the args it was called
// with so a test can assert on the `where`/`data` the service built — the ownership
// predicate (skill §8/§27) and the never-enable rule (§25) are visible there.
// ─────────────────────────────────────────────────────────────────────────────

interface Calls {
  settingsUpsert: { where: unknown; create: Record<string, unknown>; update: Record<string, unknown> }[]
  appUpdateMany: { where: Record<string, unknown>; data: Record<string, unknown> }[]
  eventCreate: Record<string, unknown>[]
}

function makeCtx(options: {
  userId?: string | null
  settingsRow?: Record<string, unknown> | null
  runs?: Record<string, unknown>[]
  applications?: Record<string, unknown>[]
  updateManyCount?: number
}) {
  const calls: Calls = { settingsUpsert: [], appUpdateMany: [], eventCreate: [] }

  const prisma = {
    candidateAutomationSettings: {
      findUnique: async () => options.settingsRow ?? null,
      upsert: async (args: { where: unknown; create: Record<string, unknown>; update: Record<string, unknown> }) => {
        calls.settingsUpsert.push(args)
        // Mimic upsert: existing row → merge update, else the create payload over the
        // column defaults Prisma would supply (arrays default to [], not undefined).
        return options.settingsRow
          ? { ...options.settingsRow, ...args.update }
          : {
              enabled: false,
              frequency: 'WEEKLY',
              maxApplicationsPerRun: null,
              maxApplicationsPerDay: null,
              minMatchScore: null,
              approvalMode: true,
              keywords: [],
              locations: [],
              contractTypes: [],
              nextRunAt: null,
              ...args.create,
            }
      },
    },
    automationRun: {
      findMany: async () => options.runs ?? [],
    },
    application: {
      findMany: async () => options.applications ?? [],
      updateMany: async (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
        calls.appUpdateMany.push(args)
        return { count: options.updateManyCount ?? 0 }
      },
    },
    applicationEvent: {
      create: async (args: { data: Record<string, unknown> }) => {
        calls.eventCreate.push(args.data)
        return args.data
      },
    },
  }

  const ctx = {
    prisma,
    user: options.userId === null ? null : { id: options.userId ?? 'cand-1', role: 'USER' },
    audit: { ipAddress: null, userAgent: null },
  } as unknown as Context

  return { ctx, calls }
}

const settingsRow = (overrides: Record<string, unknown> = {}) => ({
  candidateId: 'cand-1',
  enabled: true,
  frequency: 'WEEKLY',
  maxApplicationsPerRun: null,
  maxApplicationsPerDay: null,
  minMatchScore: null,
  approvalMode: true,
  keywords: [],
  locations: [],
  contractTypes: [],
  nextRunAt: new Date('2026-10-10T00:00:00.000Z'),
  ...overrides,
})

describe('getMyAutomationSettings', () => {
  it('reports automation off with server defaults when no row exists (§25)', async () => {
    const { ctx } = makeCtx({ settingsRow: null })

    const view = await getMyAutomationSettings(ctx)

    assert.equal(view.enabled, false)
    assert.equal(view.nextRunAt, null)
    assert.equal(view.minMatchScore, AUTOMATION_DEFAULTS.minMatchScore)
    assert.deepEqual(view.ceilings, AUTOMATION_CEILINGS)
    assert.deepEqual(view.defaults, AUTOMATION_DEFAULTS)
  })

  it('clamps a preference above the ceiling rather than trusting it (§16)', async () => {
    const { ctx } = makeCtx({ settingsRow: settingsRow({ maxApplicationsPerRun: 9999 }) })

    const view = await getMyAutomationSettings(ctx)

    assert.equal(view.maxApplicationsPerRun, AUTOMATION_CEILINGS.maxApplicationsPerRun)
  })

  it('serialises nextRunAt as an ISO string', async () => {
    const { ctx } = makeCtx({ settingsRow: settingsRow() })

    const view = await getMyAutomationSettings(ctx)

    assert.equal(view.nextRunAt, '2026-10-10T00:00:00.000Z')
  })

  it('rejects an anonymous caller', async () => {
    const { ctx } = makeCtx({ userId: null })
    await assert.rejects(() => getMyAutomationSettings(ctx))
  })
})

describe('updateAutomationSettings', () => {
  it('never writes `enabled` — saving preferences cannot turn automation on (§25)', async () => {
    const { ctx, calls } = makeCtx({ settingsRow: null })

    await updateAutomationSettings(ctx, { minMatchScore: 80, keywords: ['react'] })

    const call = calls.settingsUpsert[0]
    assert.equal('enabled' in call.update, false)
    // The create path pins enabled:false so a first save stays off.
    assert.equal(call.create.enabled, false)
    assert.equal(call.create.nextRunAt, null)
  })

  it('forwards only the fields the caller sent (undefined = unchanged)', async () => {
    const { ctx, calls } = makeCtx({ settingsRow: settingsRow() })

    await updateAutomationSettings(ctx, { minMatchScore: 80 })

    assert.deepEqual(Object.keys(calls.settingsUpsert[0].update), ['minMatchScore'])
    assert.equal(calls.settingsUpsert[0].update.minMatchScore, 80)
  })

  it('scopes the upsert to the signed-in candidate', async () => {
    const { ctx, calls } = makeCtx({ userId: 'cand-9', settingsRow: null })

    await updateAutomationSettings(ctx, { frequency: 'DAILY' })

    assert.deepEqual(calls.settingsUpsert[0].where, { candidateId: 'cand-9' })
  })

  it('rejects an invalid frequency', async () => {
    const { ctx } = makeCtx({ settingsRow: null })
    await assert.rejects(() => updateAutomationSettings(ctx, { frequency: 'HOURLY' }), /Invalid automation settings/)
  })

  it('rejects a match score out of range', async () => {
    const { ctx } = makeCtx({ settingsRow: null })
    await assert.rejects(() => updateAutomationSettings(ctx, { minMatchScore: 150 }), /Invalid automation settings/)
  })
})

describe('setAutomationEnabled', () => {
  it('schedules the first run immediately on enable', async () => {
    const { ctx, calls } = makeCtx({ settingsRow: null })

    const view = await setAutomationEnabled(ctx, true)

    assert.equal(view.enabled, true)
    assert.notEqual(calls.settingsUpsert[0].create.nextRunAt, null)
    assert.notEqual(view.nextRunAt, null)
  })

  it('preserves an already-scheduled run when re-enabling', async () => {
    const existing = settingsRow({ enabled: false })
    const { ctx, calls } = makeCtx({ settingsRow: existing })

    await setAutomationEnabled(ctx, true)

    assert.equal(calls.settingsUpsert[0].update.nextRunAt, existing.nextRunAt)
  })

  it('clears the schedule on disable', async () => {
    const { ctx, calls } = makeCtx({ settingsRow: settingsRow() })

    const view = await setAutomationEnabled(ctx, false)

    assert.equal(calls.settingsUpsert[0].update.enabled, false)
    assert.equal(calls.settingsUpsert[0].update.nextRunAt, null)
    assert.equal(view.nextRunAt, null)
  })
})

describe('getMyAutomationRuns', () => {
  it('maps applicationsSent onto the prepared-count field', async () => {
    const { ctx } = makeCtx({
      runs: [
        {
          id: 'run-1',
          status: 'COMPLETED',
          startedAt: new Date('2026-10-01T00:00:00.000Z'),
          completedAt: new Date('2026-10-01T00:05:00.000Z'),
          jobsDiscovered: 10,
          jobsMatched: 4,
          applicationsSent: 3,
          failures: 0,
        },
      ],
    })

    const [run] = await getMyAutomationRuns(ctx, 5)

    assert.equal(run.applicationsPrepared, 3)
    assert.equal(run.completedAt, '2026-10-01T00:05:00.000Z')
  })
})

describe('getMyPreparedApplications', () => {
  it('surfaces the resolved recipient to the owner reviewing their own application (§8)', async () => {
    // §8 data minimisation applies to third parties, not to the candidate deciding
    // whether to send their OWN application: the review screen shows the recipient so
    // they can make that call. hasContact stays for back-compat.
    const { ctx } = makeCtx({
      applications: [
        {
          id: 'app-1',
          stage: 'READY_TO_SEND',
          matchScore: 88,
          recipientEmail: 'recruiter@acme.example',
          coverLetter: 'Bonjour',
          createdAt: new Date('2026-10-02T00:00:00.000Z'),
          jobOffer: { title: 'Dev', company: 'Acme', location: 'Paris', url: 'https://x' },
        },
      ],
    })

    const [app] = await getMyPreparedApplications(ctx)

    assert.equal(app.hasContact, true)
    assert.equal(app.recipientEmail, 'recruiter@acme.example')
    assert.equal(app.jobTitle, 'Dev')
  })

  it('reports hasContact false when no recipient was resolved', async () => {
    const { ctx } = makeCtx({
      applications: [
        {
          id: 'app-2',
          stage: 'PREPARING',
          matchScore: null,
          recipientEmail: null,
          coverLetter: null,
          createdAt: new Date('2026-10-02T00:00:00.000Z'),
          jobOffer: null,
        },
      ],
    })

    const [app] = await getMyPreparedApplications(ctx)

    assert.equal(app.hasContact, false)
    assert.equal(app.jobTitle, 'Offre')
  })
})

describe('cancelPreparedApplication', () => {
  it('scopes the update to the owner and only cancellable stages', async () => {
    const { ctx, calls } = makeCtx({ updateManyCount: 1 })

    await cancelPreparedApplication(ctx, 'app-1')

    const where = calls.appUpdateMany[0].where
    assert.equal(where.id, 'app-1')
    assert.equal(where.userId, 'cand-1')
    assert.equal(where.source, 'AUTOMATED')
    assert.equal(calls.appUpdateMany[0].data.stage, 'CANCELLED')
    assert.equal(calls.eventCreate[0].type, 'CANCELLED_BY_CANDIDATE')
  })

  it('reports not-found when the id matches no owned row', async () => {
    const { ctx, calls } = makeCtx({ updateManyCount: 0 })

    await assert.rejects(() => cancelPreparedApplication(ctx, 'foreign'), /Application not found/)
    assert.equal(calls.eventCreate.length, 0)
  })
})
