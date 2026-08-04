import assert from 'node:assert/strict'
import { describe, it, mock } from 'node:test'
import type { Context } from '@/context.js'
import { createCv, getMyCv, optimizeCv, updateCvDetails } from '../cvService.js'

function buildContext(cv: Partial<Context['prisma']['cv']>, userId = 'u1'): Context {
  return {
    prisma: { cv } as unknown as Context['prisma'],
    user: { id: userId } as Context['user'],
  }
}

const baseCv = {
  id: 'cv1',
  userId: 'u1',
  pdfUrl: '/uploads/cv/u1-abc.pdf',
  fileName: 'cv.pdf',
  fileSizeBytes: 1000,
  template: null,
  extractedData: null,
  optimizedHtml: null,
  improvements: null,
  status: 'UPLOADED',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('cvService', () => {
  it('getMyCv reads the latest CV by userId', async () => {
    const findFirst = mock.fn(async (_args: unknown) => ({ ...baseCv }))
    const ctx = buildContext({ findFirst: findFirst as never })

    const result = await getMyCv(ctx)

    assert.equal(findFirst.mock.calls.length, 1)
    assert.deepEqual(findFirst.mock.calls[0].arguments[0], {
      where: { userId: 'u1' },
      orderBy: { createdAt: 'desc' },
    })
    assert.equal(result?.id, 'cv1')
  })

  it('getMyCv returns null when unauthenticated', async () => {
    const findFirst = mock.fn()
    const ctx = { prisma: { cv: { findFirst } } as unknown as Context['prisma'], user: null }

    const result = await getMyCv(ctx)

    assert.equal(result, null)
    assert.equal(findFirst.mock.calls.length, 0)
  })

  it('createCv rejects a file larger than the max size without touching Prisma', async () => {
    const create = mock.fn()
    const ctx = buildContext({ create: create as never })

    await assert.rejects(
      () => createCv(ctx, { pdfUrl: '/uploads/cv/x.pdf', fileName: 'x.pdf', fileSizeBytes: 99_999_999 }),
      /Invalid CV upload data/,
    )
    assert.equal(create.mock.calls.length, 0)
  })

  it('optimizeCv rejects a CV owned by another user', async () => {
    const findUnique = mock.fn(async () => ({ ...baseCv, userId: 'someone-else' }))
    const ctx = buildContext({ findUnique: findUnique as never })

    await assert.rejects(() => optimizeCv(ctx, 'cv1'), /CV not found/)
  })

  it('optimizeCv rejects a CV that has not been extracted yet', async () => {
    const findUnique = mock.fn(async () => ({ ...baseCv, extractedData: null }))
    const update = mock.fn()
    const ctx = buildContext({ findUnique: findUnique as never, update: update as never })

    await assert.rejects(() => optimizeCv(ctx, 'cv1'), /must be extracted/)
    assert.equal(update.mock.calls.length, 0)
  })

  it('updateCvDetails rejects a CV owned by another user', async () => {
    const findUnique = mock.fn(async () => ({ ...baseCv, userId: 'someone-else' }))
    const ctx = buildContext({ findUnique: findUnique as never })

    await assert.rejects(() => updateCvDetails(ctx, 'cv1', { fullName: 'Ada' }), /CV not found/)
  })

  it('updateCvDetails merges edited fields into extractedData', async () => {
    const findUnique = mock.fn(async () => ({ ...baseCv, extractedData: { fullName: 'Old Name', email: 'a@b.c' } }))
    const update = mock.fn(async (args: { data: Record<string, unknown> }) => ({ ...baseCv, ...args.data }))
    const ctx = buildContext({ findUnique: findUnique as never, update: update as never })

    await updateCvDetails(ctx, 'cv1', { fullName: 'Ada Lovelace' })

    assert.deepEqual(update.mock.calls[0].arguments[0].data.extractedData, {
      fullName: 'Ada Lovelace',
      email: 'a@b.c',
    })
  })
})
