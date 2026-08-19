import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Training } from '@prisma/client'
import { toGraphQLTraining } from '../trainingsMappers.js'

const training = (overrides: Partial<Training> = {}): Training =>
  ({
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
    published: true,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    ...overrides,
  }) as Training

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

  it('never leaks the catalog-management fields', () => {
    const mapped = toGraphQLTraining(training()) as Record<string, unknown>

    assert.equal('published' in mapped, false)
    assert.equal('createdAt' in mapped, false)
  })

  it('keeps a null price as null — free is not zero', () => {
    assert.equal(toGraphQLTraining(training({ priceCents: null })).priceCents, null)
  })

  it('passes optional text fields through untouched', () => {
    const mapped = toGraphQLTraining(training({ description: null, instructor: null }))

    assert.equal(mapped.description, null)
    assert.equal(mapped.instructor, null)
  })
})
