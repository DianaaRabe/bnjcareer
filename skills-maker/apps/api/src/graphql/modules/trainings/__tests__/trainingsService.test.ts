import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Context } from '@/context.js'
import { listTrainings } from '../trainingsService.js'

type FindManyArgs = { where?: Record<string, unknown>; orderBy?: Record<string, unknown> }

const contextWith = (rows: Record<string, unknown>[]) => {
  const calls: FindManyArgs[] = []

  const prisma = {
    training: {
      findMany: async (args: FindManyArgs) => {
        calls.push(args)
        return rows
      },
    },
  }

  return { ctx: { prisma, user: null } as unknown as Context, calls }
}

const row = (overrides: Record<string, unknown> = {}) => ({
  id: 'training-1',
  title: 'Optimiser son CV',
  description: null,
  category: 'CV',
  level: 'BEGINNER',
  priceCents: null,
  modules: 3,
  durationDays: 3,
  instructor: null,
  certificate: false,
  published: true,
  createdAt: new Date(),
  ...overrides,
})

describe('listTrainings', () => {
  it('returns an empty catalog rather than throwing', async () => {
    const { ctx } = contextWith([])

    assert.deepEqual(await listTrainings(ctx), [])
  })

  it('asks the database for published trainings only', async () => {
    const { ctx, calls } = contextWith([])

    await listTrainings(ctx)

    assert.deepEqual(calls[0].where, { published: true })
  })

  it('orders the catalog newest first', async () => {
    const { ctx, calls } = contextWith([])

    await listTrainings(ctx)

    assert.deepEqual(calls[0].orderBy, { createdAt: 'desc' })
  })

  it('maps every row through the GraphQL shape', async () => {
    const { ctx } = contextWith([row(), row({ id: 'training-2', title: 'Négociation' })])

    const trainings = await listTrainings(ctx)

    assert.equal(trainings.length, 2)
    assert.deepEqual(
      trainings.map(({ id }) => id),
      ['training-1', 'training-2'],
    )
    assert.equal('published' in trainings[0], false)
  })
})
