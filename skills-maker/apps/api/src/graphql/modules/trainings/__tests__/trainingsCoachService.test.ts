import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Context } from '@/context.js'
import {
  addTrainingModule,
  createTraining,
  deleteTraining,
  getMyTraining,
  listMyTrainings,
  removeTrainingModule,
  updateTraining,
  updateTrainingModule,
} from '../trainingsCoachService.js'

const trainingRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'training-1',
  coachId: 'coach-1',
  title: 'Optimiser son CV',
  description: null,
  category: 'CV',
  level: 'BEGINNER',
  priceCents: null,
  durationDays: 3,
  instructor: null,
  certificate: false,
  published: false,
  createdAt: new Date(),
  _count: { curriculum: 0 },
  ...overrides,
})

const moduleRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'module-1',
  trainingId: 'training-1',
  title: 'Structurer son CV',
  summary: null,
  position: 1,
  durationMinutes: null,
  ...overrides,
})

type WriteArgs = { data: Record<string, unknown>; where?: Record<string, unknown> }

type Calls = {
  findMany: Record<string, unknown>[]
  findFirst: Record<string, unknown>[]
  create: WriteArgs[]
  update: WriteArgs[]
  delete: Record<string, unknown>[]
  moduleFindMany: Record<string, unknown>[]
  moduleFindFirst: Record<string, unknown>[]
  moduleCreate: WriteArgs[]
  moduleUpdate: WriteArgs[]
  moduleDelete: Record<string, unknown>[]
  transaction: unknown[][]
}

const contextWith = (fixture: {
  trainings?: Record<string, unknown>[]
  training?: Record<string, unknown> | null
  createdTraining?: Record<string, unknown>
  updatedTraining?: Record<string, unknown>
  modules?: Record<string, unknown>[]
  module?: Record<string, unknown> | null
  createdModule?: Record<string, unknown>
  updatedModule?: Record<string, unknown>
}) => {
  const calls: Calls = {
    findMany: [],
    findFirst: [],
    create: [],
    update: [],
    delete: [],
    moduleFindMany: [],
    moduleFindFirst: [],
    moduleCreate: [],
    moduleUpdate: [],
    moduleDelete: [],
    transaction: [],
  }

  const prisma = {
    training: {
      findMany: async (args: Record<string, unknown>) => {
        calls.findMany.push(args)
        return fixture.trainings ?? []
      },
      findFirst: async (args: Record<string, unknown>) => {
        calls.findFirst.push(args)
        return fixture.training ?? null
      },
      create: async (args: WriteArgs) => {
        calls.create.push(args)
        return fixture.createdTraining ?? trainingRow()
      },
      update: async (args: WriteArgs) => {
        calls.update.push(args)
        return fixture.updatedTraining ?? trainingRow()
      },
      delete: async (args: Record<string, unknown>) => {
        calls.delete.push(args)
        return trainingRow()
      },
    },
    trainingModule: {
      count: async () => (fixture.modules ?? []).length,
      findMany: async (args: Record<string, unknown>) => {
        calls.moduleFindMany.push(args)
        return fixture.modules ?? []
      },
      findFirst: async (args: Record<string, unknown>) => {
        calls.moduleFindFirst.push(args)
        return fixture.module ?? null
      },
      create: async (args: WriteArgs) => {
        calls.moduleCreate.push(args)
        return fixture.createdModule ?? moduleRow()
      },
      update: async (args: WriteArgs) => {
        calls.moduleUpdate.push(args)
        return fixture.updatedModule ?? moduleRow()
      },
      delete: async (args: Record<string, unknown>) => {
        calls.moduleDelete.push(args)
        return moduleRow()
      },
    },
    $transaction: async (ops: unknown[]) => {
      calls.transaction.push(ops)
      return Promise.all(ops as Promise<unknown>[])
    },
  }

  return { ctx: { prisma, user: null, audit: {} } as unknown as Context, calls }
}

describe('listMyTrainings', () => {
  it('scopes the query to the authenticated coach', async () => {
    const { ctx, calls } = contextWith({})

    await listMyTrainings(ctx, 'coach-1')

    assert.deepEqual(calls.findMany[0]?.where, { coachId: 'coach-1', removed: false })
  })

  it('never hides drafts from their own coach', async () => {
    const { ctx } = contextWith({ trainings: [trainingRow({ published: false })] })

    const trainings = await listMyTrainings(ctx, 'coach-1')

    assert.equal(trainings[0]?.published, false)
  })
})

describe('getMyTraining', () => {
  it('reports a training owned by someone else as missing, never as forbidden', async () => {
    const { ctx } = contextWith({ training: null })

    await assert.rejects(() => getMyTraining(ctx, 'coach-1', 'training-1'), /Training not found/)
  })
})

describe('createTraining', () => {
  const validInput = { title: 'Négocier son salaire', category: 'CV', level: 'BEGINNER', durationDays: 2 }

  it('always creates a draft, whatever the input says', async () => {
    const { ctx, calls } = contextWith({})

    await createTraining(ctx, 'coach-1', validInput)

    assert.equal(calls.create[0]?.data.published, false)
  })

  it('owns the training with the calling coach, not a client-supplied id', async () => {
    const { ctx, calls } = contextWith({})

    await createTraining(ctx, 'coach-1', validInput)

    assert.equal(calls.create[0]?.data.coachId, 'coach-1')
  })

  it('rejects a blank title', async () => {
    const { ctx } = contextWith({})

    await assert.rejects(
      () => createTraining(ctx, 'coach-1', { ...validInput, title: '   ' }),
      /Invalid training data/,
    )
  })

  it('rejects a non-positive duration', async () => {
    const { ctx } = contextWith({})

    await assert.rejects(
      () => createTraining(ctx, 'coach-1', { ...validInput, durationDays: 0 }),
      /Invalid training data/,
    )
  })
})

describe('updateTraining', () => {
  it('refuses to update a training that belongs to another coach', async () => {
    const { ctx } = contextWith({ training: null })

    await assert.rejects(
      () => updateTraining(ctx, 'coach-1', 'training-1', { title: 'New title' }),
      /Training not found/,
    )
  })

  it('leaves omitted fields untouched', async () => {
    const { ctx, calls } = contextWith({ training: trainingRow() })

    await updateTraining(ctx, 'coach-1', 'training-1', { title: 'New title' })

    assert.deepEqual(calls.update[0]?.data, { title: 'New title' })
  })

  it('can flip a draft to published', async () => {
    const { ctx, calls } = contextWith({ training: trainingRow() })

    await updateTraining(ctx, 'coach-1', 'training-1', { published: true })

    assert.equal(calls.update[0]?.data.published, true)
  })
})

describe('deleteTraining', () => {
  it('refuses to delete a training that belongs to another coach', async () => {
    const { ctx } = contextWith({ training: null })

    await assert.rejects(() => deleteTraining(ctx, 'coach-1', 'training-1'), /Training not found/)
  })

  it('soft-deletes once ownership is confirmed, rather than removing the row', async () => {
    const { ctx, calls } = contextWith({ training: trainingRow() })

    const result = await deleteTraining(ctx, 'coach-1', 'training-1')

    assert.equal(result, true)
    assert.equal(calls.delete.length, 0)
    assert.deepEqual(calls.update[0]?.where, { id: 'training-1' })
    assert.deepEqual(calls.update[0]?.data, { removed: true })
  })
})

describe('addTrainingModule', () => {
  it('refuses to add a module to a training owned by someone else', async () => {
    const { ctx } = contextWith({ training: null })

    await assert.rejects(
      () => addTrainingModule(ctx, 'coach-1', 'training-1', { title: 'Module' }),
      /Training not found/,
    )
  })

  it('appends after the last existing position', async () => {
    const { ctx, calls } = contextWith({
      training: trainingRow(),
      modules: [moduleRow({ position: 1 }), moduleRow({ id: 'module-2', position: 2 })],
    })

    await addTrainingModule(ctx, 'coach-1', 'training-1', { title: 'Nouveau module' })

    assert.equal(calls.moduleCreate[0]?.data.position, 3)
  })
})

describe('updateTrainingModule', () => {
  it('refuses to update a module of a training owned by someone else', async () => {
    const { ctx } = contextWith({ module: null })

    await assert.rejects(
      () => updateTrainingModule(ctx, 'coach-1', 'module-1', { title: 'Renamed' }),
      /Training module not found/,
    )
  })
})

describe('removeTrainingModule', () => {
  it('shifts the following modules up so positions stay contiguous', async () => {
    const { ctx, calls } = contextWith({
      module: moduleRow({ position: 2 }),
      modules: [moduleRow({ id: 'module-3', position: 3 }), moduleRow({ id: 'module-4', position: 4 })],
    })

    await removeTrainingModule(ctx, 'coach-1', 'module-2')

    assert.equal(calls.transaction.length, 1)
    assert.equal(calls.moduleUpdate[0]?.data.position, 2)
    assert.equal(calls.moduleUpdate[1]?.data.position, 3)
  })
})
