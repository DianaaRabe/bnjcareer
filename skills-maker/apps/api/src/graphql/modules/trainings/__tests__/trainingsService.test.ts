import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Context } from '@/context.js'
import { getTraining, listCurriculum, listTrainings } from '../trainingsService.js'

type QueryArgs = { where?: Record<string, unknown>; orderBy?: unknown; include?: unknown }

type Fixture = {
  rows?: Record<string, unknown>[]
  detail?: Record<string, unknown> | null
  modules?: Record<string, unknown>[]
}

/** Minimal Prisma stub — the service only ever reads, so plain rows are enough. */
const contextWith = (fixture: Fixture) => {
  const calls: Record<string, QueryArgs[]> = { findMany: [], findFirst: [], moduleFindMany: [] }

  const prisma = {
    training: {
      findMany: async (args: QueryArgs) => {
        calls.findMany.push(args)
        return fixture.rows ?? []
      },
      findFirst: async (args: QueryArgs) => {
        calls.findFirst.push(args)
        return fixture.detail ?? null
      },
    },
    trainingModule: {
      findMany: async (args: QueryArgs) => {
        calls.moduleFindMany.push(args)
        return fixture.modules ?? []
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
  durationDays: 3,
  instructor: null,
  certificate: false,
  published: true,
  createdAt: new Date(),
  _count: { curriculum: 2 },
  ...overrides,
})

describe('listTrainings', () => {
  it('returns an empty catalog rather than throwing', async () => {
    const { ctx } = contextWith({})

    assert.deepEqual(await listTrainings(ctx), [])
  })

  it('asks the database for published trainings only, newest first', async () => {
    const { ctx, calls } = contextWith({})

    await listTrainings(ctx)

    assert.deepEqual(calls.findMany[0].where, { published: true })
    assert.deepEqual(calls.findMany[0].orderBy, { createdAt: 'desc' })
  })

  it('counts the curriculum in the same query instead of one per row', async () => {
    const { ctx, calls } = contextWith({ rows: [row(), row({ id: 'training-2' })] })

    await listTrainings(ctx)

    assert.deepEqual(calls.findMany[0].include, { _count: { select: { curriculum: true } } })
    assert.equal(calls.moduleFindMany.length, 0)
  })

  it('maps every row through the GraphQL shape', async () => {
    const { ctx } = contextWith({ rows: [row(), row({ id: 'training-2', title: 'Négociation' })] })

    const trainings = await listTrainings(ctx)

    assert.deepEqual(
      trainings.map(({ id }) => id),
      ['training-1', 'training-2'],
    )
    assert.equal(trainings[0].modules, 2)
    assert.equal('published' in trainings[0], false)
  })
})

describe('getTraining', () => {
  it('rejects an unknown id with a domain error', async () => {
    const { ctx } = contextWith({ detail: null })

    await assert.rejects(() => getTraining(ctx, 'missing'), /Training not found/)
  })

  it('reports an unpublished draft as missing, never as forbidden', async () => {
    const { ctx, calls } = contextWith({ detail: null })

    await assert.rejects(() => getTraining(ctx, 'draft'))

    assert.deepEqual(calls.findFirst[0].where, { id: 'draft', published: true })
  })

  it('returns the training with its programme in order', async () => {
    const { ctx, calls } = contextWith({
      detail: {
        ...row(),
        curriculum: [
          { id: 'm1', trainingId: 'training-1', title: 'Structurer', summary: null, position: 1, durationMinutes: 45 },
          { id: 'm2', trainingId: 'training-1', title: 'Rédiger', summary: null, position: 2, durationMinutes: null },
        ],
      },
    })

    const training = await getTraining(ctx, 'training-1')

    assert.equal(training.id, 'training-1')
    assert.deepEqual(
      training.curriculum?.map(({ title }) => title),
      ['Structurer', 'Rédiger'],
    )
    assert.deepEqual(calls.findFirst[0].include, {
      _count: { select: { curriculum: true } },
      curriculum: { orderBy: { position: 'asc' } },
    })
  })
})

describe('listCurriculum', () => {
  it('reads the modules of one training, ordered by position', async () => {
    const { ctx, calls } = contextWith({
      modules: [
        { id: 'm1', trainingId: 'training-1', title: 'Structurer', summary: null, position: 1, durationMinutes: 45 },
      ],
    })

    const modules = await listCurriculum(ctx, 'training-1')

    assert.deepEqual(calls.moduleFindMany[0].where, { trainingId: 'training-1' })
    assert.deepEqual(calls.moduleFindMany[0].orderBy, { position: 'asc' })
    assert.equal(modules[0].title, 'Structurer')
  })

  it('returns an empty programme when nothing is recorded', async () => {
    const { ctx } = contextWith({})

    assert.deepEqual(await listCurriculum(ctx, 'training-1'), [])
  })
})
