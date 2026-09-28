import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Context } from '@/context.js'
import { createResource, deleteResource, getCoachResource, listCoachResources, updateResource } from '../resourcesCoachService.js'

const resourceRow = (overrides: Record<string, unknown> = {}) => ({
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

type WriteArgs = { data: Record<string, unknown>; where?: Record<string, unknown> }

type Calls = {
  findMany: Record<string, unknown>[]
  findUnique: Record<string, unknown>[]
  create: WriteArgs[]
  update: WriteArgs[]
  delete: Record<string, unknown>[]
}

const contextWith = (fixture: {
  resources?: Record<string, unknown>[]
  resource?: Record<string, unknown> | null
  createdResource?: Record<string, unknown>
  updatedResource?: Record<string, unknown>
}) => {
  const calls: Calls = { findMany: [], findUnique: [], create: [], update: [], delete: [] }

  const prisma = {
    resource: {
      findMany: async (args: Record<string, unknown>) => {
        calls.findMany.push(args)
        return fixture.resources ?? []
      },
      findUnique: async (args: Record<string, unknown>) => {
        calls.findUnique.push(args)
        return fixture.resource ?? null
      },
      create: async (args: WriteArgs) => {
        calls.create.push(args)
        return fixture.createdResource ?? resourceRow()
      },
      update: async (args: WriteArgs) => {
        calls.update.push(args)
        return fixture.updatedResource ?? resourceRow()
      },
      delete: async (args: Record<string, unknown>) => {
        calls.delete.push(args)
        return resourceRow()
      },
    },
  }

  return { ctx: { prisma, user: null } as unknown as Context, calls }
}

describe('listCoachResources', () => {
  it('lists the whole library, drafts included', async () => {
    const { ctx, calls } = contextWith({ resources: [resourceRow({ published: false })] })

    const resources = await listCoachResources(ctx)

    assert.equal(calls.findMany[0]?.where, undefined)
    assert.equal(resources[0]?.published, false)
  })
})

describe('getCoachResource', () => {
  it('reports a missing resource as not found', async () => {
    const { ctx } = contextWith({ resource: null })

    await assert.rejects(() => getCoachResource(ctx, 'resource-1'), /Resource not found/)
  })
})

describe('createResource', () => {
  const validInput = { title: 'Guide STAR', type: 'PDF', category: 'INTERVIEW' }

  it('rejects a blank title', async () => {
    const { ctx } = contextWith({})

    await assert.rejects(() => createResource(ctx, { ...validInput, title: '   ' }), /Invalid resource data/)
  })

  it('defaults access to FREE when omitted', async () => {
    const { ctx, calls } = contextWith({})

    await createResource(ctx, validInput)

    assert.equal(calls.create[0]?.data.access, 'FREE')
  })

  it('leaves published unset so the model default applies, when omitted', async () => {
    const { ctx, calls } = contextWith({})

    await createResource(ctx, validInput)

    assert.equal('published' in (calls.create[0]?.data ?? {}), false)
  })

  it('honors an explicit published flag', async () => {
    const { ctx, calls } = contextWith({})

    await createResource(ctx, { ...validInput, published: false })

    assert.equal(calls.create[0]?.data.published, false)
  })
})

describe('updateResource', () => {
  it('refuses to update a resource that does not exist', async () => {
    const { ctx } = contextWith({ resource: null })

    await assert.rejects(() => updateResource(ctx, 'resource-1', { title: 'New title' }), /Resource not found/)
  })

  it('leaves omitted fields untouched', async () => {
    const { ctx, calls } = contextWith({ resource: resourceRow() })

    await updateResource(ctx, 'resource-1', { title: 'New title' })

    assert.deepEqual(calls.update[0]?.data, { title: 'New title' })
  })
})

describe('deleteResource', () => {
  it('refuses to delete a resource that does not exist', async () => {
    const { ctx } = contextWith({ resource: null })

    await assert.rejects(() => deleteResource(ctx, 'resource-1'), /Resource not found/)
  })

  it('deletes the row for real — no other model references a resource', async () => {
    const { ctx, calls } = contextWith({ resource: resourceRow() })

    const result = await deleteResource(ctx, 'resource-1')

    assert.equal(result, true)
    assert.deepEqual(calls.delete[0]?.where, { id: 'resource-1' })
  })
})
