import assert from 'node:assert/strict'
import { describe, it, mock } from 'node:test'
import { Prisma } from '@prisma/client'
import type { Context } from '@/context.js'
import type { ContactCandidate } from '@/lib/enrichment/types.js'
import { createPrismaAutomationStore } from '../store.js'
import type { CanonicalJob } from '../types.js'

const job: CanonicalJob = {
  id: 'FRANCE_TRAVAIL:1',
  source: 'FRANCE_TRAVAIL',
  title: 'Développeur',
  company: 'Acme',
  location: 'Paris',
  description: 'Une offre',
  applyUrl: 'https://acme.fr/jobs/1',
  postedAt: '2026-01-01T00:00:00.000Z',
  salary: null,
  tags: ['CDI'],
  isRemote: false,
  canonicalKey: 'url:https://acme.fr/jobs/1',
  discoveredAt: '2026-01-02T00:00:00.000Z',
}

// Loosely typed on purpose: each test swaps one delegate for a stub that returns a
// different shape, and strict mock typing would reject every one of those swaps.
/* eslint-disable @typescript-eslint/no-explicit-any */
const prismaFake = (overrides: Record<string, any> = {}): any => ({
  application: {
    findMany: mock.fn(async () => []),
    count: mock.fn(async () => 0),
    create: mock.fn(async () => ({ id: 'app-1' })),
    findFirst: mock.fn(async () => null),
  },
  jobOffer: { upsert: mock.fn(async () => ({ id: 'offer-1' })) },
  jobContact: { upsert: mock.fn(async () => ({})) },
  applicationEvent: { create: mock.fn(async () => ({})) },
  ...overrides,
})

const contextFor = (prisma: any): Context => ({
  prisma: prisma as unknown as Context['prisma'],
  user: { id: 'candidate-a' } as Context['user'],
  audit: { ipAddress: null, userAgent: null },
})

const baseInput = {
  candidateId: 'candidate-a',
  job,
  matchScore: 88,
  contact: { email: 'rh@acme.fr', contactName: null, source: 'SITE', confidence: 'VERIFIED' } as ContactCandidate,
  coverLetter: 'lettre',
  coverLetterModel: 'test-model',
  stage: 'READY_TO_SEND',
}

const p2002 = () =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', clientVersion: '5.22.0' })

describe('createPrismaAutomationStore.findApplied', () => {
  it('scopes the lookup to the candidate and keys the result by canonical key', async () => {
    const prisma = prismaFake()
    prisma.application.findMany = mock.fn(async () => [
      { id: 'app-1', stage: 'READY_TO_SEND', jobOffer: { canonicalKey: 'url:https://acme.fr/jobs/1' } },
    ])

    const applied = await createPrismaAutomationStore(contextFor(prisma)).findApplied('candidate-a', [
      'url:https://acme.fr/jobs/1',
    ])

    const args = prisma.application.findMany.mock.calls[0].arguments[0] as any
    assert.equal(args.where.userId, 'candidate-a')
    assert.deepEqual(args.where.jobOffer.canonicalKey.in, ['url:https://acme.fr/jobs/1'])
    assert.equal(applied.get('url:https://acme.fr/jobs/1')?.applicationId, 'app-1')
  })

  it('never queries the database for an empty key list', async () => {
    const prisma = prismaFake()
    const applied = await createPrismaAutomationStore(contextFor(prisma)).findApplied('candidate-a', [])

    assert.equal(applied.size, 0)
    assert.equal(prisma.application.findMany.mock.calls.length, 0)
  })
})

describe('createPrismaAutomationStore.countPreparedSince', () => {
  it('counts only this candidate’s automated applications for the day', async () => {
    const prisma = prismaFake()
    const since = new Date('2026-01-01T00:00:00.000Z')

    await createPrismaAutomationStore(contextFor(prisma)).countPreparedSince('candidate-a', since)

    const args = prisma.application.count.mock.calls[0].arguments[0] as any
    assert.equal(args.where.userId, 'candidate-a')
    assert.equal(args.where.source, 'AUTOMATED')
    assert.equal(args.where.createdAt.gte, since)
  })
})

describe('createPrismaAutomationStore.savePrepared', () => {
  it('upserts the vacancy on its canonical key and never overwrites it', async () => {
    const prisma = prismaFake()

    const result = await createPrismaAutomationStore(contextFor(prisma)).savePrepared(baseInput)

    const args = prisma.jobOffer.upsert.mock.calls[0].arguments[0] as any
    assert.deepEqual(args.where, { canonicalKey: 'url:https://acme.fr/jobs/1' })
    assert.deepEqual(args.update, {})
    assert.equal(args.create.discoveredAt.toISOString(), '2026-01-02T00:00:00.000Z')
    assert.equal(result.created, true)
    assert.equal(result.jobOfferId, 'offer-1')
  })

  it('reuses the existing row when the unique constraint is already satisfied', async () => {
    const prisma = prismaFake()
    prisma.application.create = mock.fn(async () => {
      throw p2002()
    })
    prisma.application.findFirst = mock.fn(async () => ({ id: 'existing' }))

    const result = await createPrismaAutomationStore(contextFor(prisma)).savePrepared(baseInput)

    assert.equal(result.created, false)
    assert.equal(result.applicationId, 'existing')
  })

  it('rethrows a constraint error that is not the idempotency one', async () => {
    const prisma = prismaFake()
    prisma.application.create = mock.fn(async () => {
      throw new Prisma.PrismaClientKnownRequestError('FK violation', { code: 'P2003', clientVersion: '5.22.0' })
    })

    await assert.rejects(() => createPrismaAutomationStore(contextFor(prisma)).savePrepared(baseInput))
  })
})

describe('createPrismaAutomationStore.saveContact', () => {
  it('stamps verifiedAt only for a verified address', async () => {
    const prisma = prismaFake()
    const store = createPrismaAutomationStore(contextFor(prisma))

    await store.saveContact('offer-1', baseInput.contact!)
    await store.saveContact('offer-1', { ...baseInput.contact!, confidence: 'GUESSED' })

    const verified = prisma.jobContact.upsert.mock.calls[0].arguments[0] as any
    const guessed = prisma.jobContact.upsert.mock.calls[1].arguments[0] as any

    assert.ok(verified.create.verifiedAt instanceof Date)
    assert.equal(guessed.create.verifiedAt, null)
    // A guess must not silently upgrade a previously verified address.
    assert.deepEqual(guessed.update, {})
  })

  it('upgrades a previously guessed address once it is verified', async () => {
    const prisma = prismaFake()
    await createPrismaAutomationStore(contextFor(prisma)).saveContact('offer-1', baseInput.contact!)

    const args = prisma.jobContact.upsert.mock.calls[0].arguments[0] as any
    assert.equal(args.update.confidence, 'VERIFIED')
    assert.ok(args.update.verifiedAt instanceof Date)
  })
})
