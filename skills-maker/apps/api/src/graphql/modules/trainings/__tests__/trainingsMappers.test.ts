import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  toGraphQLTraining,
  toGraphQLTrainingDetail,
  toGraphQLTrainingModule,
  type TrainingWithCount,
  type TrainingWithCurriculum,
} from '../trainingsMappers.js'

const training = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'training-1',
    title: 'Optimiser son CV',
    description: 'Transformer son CV en argumentaire.',
    category: 'CV',
    level: 'BEGINNER',
    priceCents: 4900,
    durationDays: 3,
    instructor: 'Léa Fontaine',
    certificate: true,
    published: true,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    _count: { curriculum: 3 },
    ...overrides,
  }) as unknown as TrainingWithCount

const module_ = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'module-1',
    trainingId: 'training-1',
    title: 'Structurer son CV',
    summary: 'Les rubriques qui comptent.',
    position: 1,
    durationMinutes: 45,
    ...overrides,
  }) as never

describe('toGraphQLTraining', () => {
  it('exposes the catalog fields a candidate needs', () => {
    assert.deepEqual(toGraphQLTraining(training()), {
      id: 'training-1',
      title: 'Optimiser son CV',
      description: 'Transformer son CV en argumentaire.',
      category: 'CV',
      level: 'BEGINNER',
      priceCents: 4900,
      modules: 3,
      durationDays: 3,
      instructor: 'Léa Fontaine',
      certificate: true,
    })
  })

  it('derives the module count from the curriculum rows', () => {
    assert.equal(toGraphQLTraining(training({ _count: { curriculum: 0 } })).modules, 0)
    assert.equal(toGraphQLTraining(training({ _count: { curriculum: 7 } })).modules, 7)
  })

  it('never leaks the catalog-management fields', () => {
    const mapped = toGraphQLTraining(training()) as Record<string, unknown>

    assert.equal('published' in mapped, false)
    assert.equal('createdAt' in mapped, false)
    assert.equal('_count' in mapped, false)
  })

  it('keeps a null price as null — free is not zero', () => {
    assert.equal(toGraphQLTraining(training({ priceCents: null })).priceCents, null)
  })

  it('passes optional text fields through untouched', () => {
    const mapped = toGraphQLTraining(training({ description: null, instructor: null }))

    assert.equal(mapped.description, null)
    assert.equal(mapped.instructor, null)
  })

  it('leaves the curriculum out of the catalog shape', () => {
    assert.equal(toGraphQLTraining(training()).curriculum, undefined)
  })
})

describe('toGraphQLTrainingModule', () => {
  it('exposes the programme fields without the foreign key', () => {
    const mapped = toGraphQLTrainingModule(module_()) as Record<string, unknown>

    assert.deepEqual(mapped, {
      id: 'module-1',
      title: 'Structurer son CV',
      summary: 'Les rubriques qui comptent.',
      position: 1,
      durationMinutes: 45,
    })
    assert.equal('trainingId' in mapped, false)
  })

  it('keeps an unspecified duration as null', () => {
    assert.equal(toGraphQLTrainingModule(module_({ durationMinutes: null })).durationMinutes, null)
  })
})

describe('toGraphQLTrainingDetail', () => {
  it('attaches the mapped curriculum to the catalog shape', () => {
    const detail = toGraphQLTrainingDetail({
      ...training(),
      curriculum: [module_(), module_({ id: 'module-2', position: 2 })],
    } as unknown as TrainingWithCurriculum)

    assert.equal(detail.title, 'Optimiser son CV')
    assert.deepEqual(detail.curriculum?.map(({ position }) => position), [1, 2])
  })

  it('returns an empty programme rather than undefined', () => {
    const detail = toGraphQLTrainingDetail({
      ...training({ _count: { curriculum: 0 } }),
      curriculum: [],
    } as unknown as TrainingWithCurriculum)

    assert.deepEqual(detail.curriculum, [])
  })
})
