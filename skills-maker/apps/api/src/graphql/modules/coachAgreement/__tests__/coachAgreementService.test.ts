import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Context } from '@/context.js'
import {
  CURRENT_CONTRACT_VERSION,
  FORMATION_SHARE_PLATFORM_PCT,
  SUBSCRIPTION_SHARE_COACH_PCT,
} from '../coachAgreementConstants.js'
import { getCoachAgreementStatus, signCoachAgreement } from '../coachAgreementService.js'

type Fixture = { existing?: Record<string, unknown> | null }

const row = (overrides: Record<string, unknown> = {}) => ({
  id: 'agreement-1',
  coachId: 'coach-1',
  contractVersion: CURRENT_CONTRACT_VERSION,
  signedName: 'Chris Coach',
  subscriptionShareCoachPct: SUBSCRIPTION_SHARE_COACH_PCT,
  formationSharePlatformPct: FORMATION_SHARE_PLATFORM_PCT,
  acceptedAt: new Date('2026-08-01T10:00:00.000Z'),
  ipAddress: null,
  userAgent: null,
  revokedAt: null,
  ...overrides,
})

const contextWith = (fixture: Fixture) => {
  const calls: { findFirst: Record<string, unknown>[]; create: Record<string, unknown>[] } = {
    findFirst: [],
    create: [],
  }

  const prisma = {
    coachAgreement: {
      findFirst: async (args: { where: Record<string, unknown> }) => {
        calls.findFirst.push(args.where)
        return fixture.existing ?? null
      },
      create: async (args: { data: Record<string, unknown> }) => {
        calls.create.push(args.data)
        return row(args.data)
      },
    },
  }

  const ctx = {
    prisma,
    user: null,
    audit: { ipAddress: '203.0.113.7', userAgent: 'Firefox' },
  } as unknown as Context

  return { ctx, calls }
}

const validInput = { contractVersion: CURRENT_CONTRACT_VERSION, signedName: 'Chris Coach' }
const audit = { ipAddress: '203.0.113.7', userAgent: 'Firefox' }

describe('getCoachAgreementStatus', () => {
  it('reports an unsigned agreement with the terms in force', async () => {
    const { ctx } = contextWith({ existing: null })

    const status = await getCoachAgreementStatus(ctx, 'coach-1')

    assert.equal(status.isSigned, false)
    assert.equal(status.signature, null)
    assert.equal(status.terms.currentVersion, CURRENT_CONTRACT_VERSION)
    assert.equal(status.terms.subscriptionShareCoachPct, SUBSCRIPTION_SHARE_COACH_PCT)
  })

  it('only looks for a signature on the current version, not a revoked one', async () => {
    const { ctx, calls } = contextWith({ existing: null })

    await getCoachAgreementStatus(ctx, 'coach-1')

    assert.deepEqual(calls.findFirst[0], {
      coachId: 'coach-1',
      contractVersion: CURRENT_CONTRACT_VERSION,
      revokedAt: null,
    })
  })

  it('returns the signature in force once signed', async () => {
    const { ctx } = contextWith({ existing: row() })

    const status = await getCoachAgreementStatus(ctx, 'coach-1')

    assert.equal(status.isSigned, true)
    assert.equal(status.signature?.signedName, 'Chris Coach')
    assert.equal(status.signature?.acceptedAt, '2026-08-01T10:00:00.000Z')
  })
})

describe('signCoachAgreement', () => {
  it('records the signature with the audit metadata from the request', async () => {
    const { ctx, calls } = contextWith({ existing: null })

    await signCoachAgreement(ctx, 'coach-1', validInput, audit)

    assert.equal(calls.create[0].signedName, 'Chris Coach')
    assert.equal(calls.create[0].ipAddress, '203.0.113.7')
    assert.equal(calls.create[0].userAgent, 'Firefox')
  })

  it('freezes the split from the constants, never from the client', async () => {
    const { ctx, calls } = contextWith({ existing: null })

    await signCoachAgreement(
      ctx,
      'coach-1',
      { ...validInput, subscriptionShareCoachPct: 90, formationSharePlatformPct: 0 },
      audit,
    )

    assert.equal(calls.create[0].subscriptionShareCoachPct, SUBSCRIPTION_SHARE_COACH_PCT)
    assert.equal(calls.create[0].formationSharePlatformPct, FORMATION_SHARE_PLATFORM_PCT)
  })

  it('keeps the first signature when the coach signs twice', async () => {
    const { ctx, calls } = contextWith({ existing: row() })

    const signature = await signCoachAgreement(ctx, 'coach-1', validInput, audit)

    assert.equal(signature.id, 'agreement-1')
    assert.equal(calls.create.length, 0)
  })

  it('refuses a signature on an outdated version', async () => {
    const { ctx } = contextWith({ existing: null })

    await assert.rejects(
      () => signCoachAgreement(ctx, 'coach-1', { ...validInput, contractVersion: '2020-01-01' }, audit),
      /no longer in force/,
    )
  })

  it('refuses a name too short to be a signature', async () => {
    const { ctx } = contextWith({ existing: null })

    await assert.rejects(
      () => signCoachAgreement(ctx, 'coach-1', { ...validInput, signedName: 'C' }, audit),
      /Invalid signature data/,
    )
  })

  it('refuses a blank name, whitespace included', async () => {
    const { ctx } = contextWith({ existing: null })

    await assert.rejects(
      () => signCoachAgreement(ctx, 'coach-1', { ...validInput, signedName: '     ' }, audit),
      /Invalid signature data/,
    )
  })

  it('trims the signature before storing it', async () => {
    const { ctx, calls } = contextWith({ existing: null })

    await signCoachAgreement(ctx, 'coach-1', { ...validInput, signedName: '  Chris Coach  ' }, audit)

    assert.equal(calls.create[0].signedName, 'Chris Coach')
  })

  it('stores null rather than undefined when the request carried no audit metadata', async () => {
    const { ctx, calls } = contextWith({ existing: null })

    await signCoachAgreement(ctx, 'coach-1', validInput, { ipAddress: null, userAgent: null })

    assert.equal(calls.create[0].ipAddress, null)
    assert.equal(calls.create[0].userAgent, null)
  })
})
