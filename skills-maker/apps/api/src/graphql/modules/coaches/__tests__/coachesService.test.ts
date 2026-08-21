import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Context } from '@/context.js'
import { listCoaches } from '../coachesService.js'

type QueryArgs = { where?: Record<string, unknown>; orderBy?: unknown; include?: unknown }

const contextWith = (rows: Record<string, unknown>[]) => {
  const calls: QueryArgs[] = []

  const prisma = {
    coachProfile: {
      findMany: async (args: QueryArgs) => {
        calls.push(args)
        return rows
      },
    },
  }

  return { ctx: { prisma, user: null } as unknown as Context, calls }
}

const row = (userId: string, overrides: Record<string, unknown> = {}) => ({
  id: `profile-${userId}`,
  userId,
  specialty: 'Leadership',
  yearsExperience: 12,
  certifications: [],
  expertise: [],
  rating: null,
  acceptingClients: true,
  published: true,
  createdAt: new Date(),
  user: { id: userId, profile: { firstName: 'Thomas', lastName: 'Dubois', avatarUrl: null, bio: null } },
  ...overrides,
})

describe('listCoaches', () => {
  it('returns an empty directory rather than throwing', async () => {
    const { ctx } = contextWith([])

    assert.deepEqual(await listCoaches(ctx), [])
  })

  it('asks the database for published coaches only', async () => {
    const { ctx, calls } = contextWith([])

    await listCoaches(ctx)

    assert.deepEqual(calls[0].where, { published: true })
  })

  it('ranks the most experienced first and pushes unknown experience last', async () => {
    const { ctx, calls } = contextWith([])

    await listCoaches(ctx)

    assert.deepEqual(calls[0].orderBy, [
      { yearsExperience: { sort: 'desc', nulls: 'last' } },
      { createdAt: 'asc' },
    ])
  })

  it('loads the identity in the same query instead of one per coach', async () => {
    const { ctx, calls } = contextWith([row('user-1'), row('user-2')])

    await listCoaches(ctx)

    assert.equal(calls.length, 1)
    assert.deepEqual(calls[0].include, { user: { include: { profile: true } } })
  })

  it('maps every row through the GraphQL shape', async () => {
    const { ctx } = contextWith([row('user-1'), row('user-2')])

    const coaches = await listCoaches(ctx)

    assert.deepEqual(
      coaches.map(({ id }) => id),
      ['user-1', 'user-2'],
    )
    assert.equal('published' in coaches[0], false)
  })
})
