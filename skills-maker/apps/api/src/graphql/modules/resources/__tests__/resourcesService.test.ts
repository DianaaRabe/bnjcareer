import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Context } from '@/context.js'
import { listResources } from '../resourcesService.js'

type QueryArgs = { where?: Record<string, unknown>; orderBy?: unknown }

const contextWith = (rows: Record<string, unknown>[]) => {
  const calls: QueryArgs[] = []

  const prisma = {
    resource: {
      findMany: async (args: QueryArgs) => {
        calls.push(args)
        return rows
      },
    },
  }

  return { ctx: { prisma, user: null } as unknown as Context, calls }
}

const row = (overrides: Record<string, unknown> = {}) => ({
  id: 'resource-1',
  title: 'Guide STAR',
  description: null,
  type: 'PDF',
  category: 'INTERVIEW',
  url: 'https://cdn.bnj.dev/star.pdf',
  sizeBytes: 921600,
  durationMinutes: null,
  access: 'FREE',
  priceCents: null,
  published: true,
  createdAt: new Date(),
  ...overrides,
})

describe('listResources', () => {
  it('returns an empty library rather than throwing', async () => {
    const { ctx } = contextWith([])

    assert.deepEqual(await listResources(ctx), [])
  })

  it('asks the database for published resources only, newest first', async () => {
    const { ctx, calls } = contextWith([])

    await listResources(ctx)

    assert.deepEqual(calls[0].where, { published: true })
    assert.deepEqual(calls[0].orderBy, { createdAt: 'desc' })
  })

  it('maps every row through the GraphQL shape', async () => {
    const { ctx } = contextWith([row(), row({ id: 'resource-2', title: 'Planner' })])

    const resources = await listResources(ctx)

    assert.deepEqual(
      resources.map(({ id }) => id),
      ['resource-1', 'resource-2'],
    )
    assert.equal('published' in resources[0], false)
  })

  it('applies the lock to the whole listing, not only the first row', async () => {
    const { ctx } = contextWith([
      row(),
      row({ id: 'resource-2', access: 'PAID', priceCents: 1900, url: 'https://cdn.bnj.dev/paid.mp4' }),
    ])

    const resources = await listResources(ctx)

    assert.equal(resources[0].url, 'https://cdn.bnj.dev/star.pdf')
    assert.equal(resources[1].url, null)
  })
})
