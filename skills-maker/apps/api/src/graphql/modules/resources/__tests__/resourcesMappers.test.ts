import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Resource } from '@prisma/client'
import { toGraphQLResource } from '../resourcesMappers.js'

const resource = (overrides: Partial<Resource> = {}): Resource =>
  ({
    id: 'resource-1',
    title: 'Guide : Maîtriser la méthode STAR',
    description: 'La méthode STAR expliquée avec 20 exemples concrets.',
    type: 'PDF',
    category: 'INTERVIEW',
    url: 'https://cdn.bnj.dev/resources/star.pdf',
    sizeBytes: 921600,
    durationMinutes: null,
    access: 'FREE',
    priceCents: null,
    published: true,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    ...overrides,
  }) as Resource

describe('toGraphQLResource', () => {
  it('exposes the library fields a candidate needs', () => {
    assert.deepEqual(toGraphQLResource(resource()), {
      id: 'resource-1',
      title: 'Guide : Maîtriser la méthode STAR',
      description: 'La méthode STAR expliquée avec 20 exemples concrets.',
      type: 'PDF',
      category: 'INTERVIEW',
      url: 'https://cdn.bnj.dev/resources/star.pdf',
      sizeBytes: 921600,
      durationMinutes: null,
      access: 'FREE',
      priceCents: null,
    })
  })

  it('never leaks the catalog-management fields', () => {
    const mapped = toGraphQLResource(resource()) as Record<string, unknown>

    assert.equal('published' in mapped, false)
    assert.equal('createdAt' in mapped, false)
  })

  it('withholds the url of a paid resource', () => {
    const mapped = toGraphQLResource(
      resource({ access: 'PAID', priceCents: 1900, url: 'https://cdn.bnj.dev/secret.mp4' }),
    )

    assert.equal(mapped.url, null)
    assert.equal(mapped.priceCents, 1900)
  })

  it('withholds the url of a premium resource', () => {
    const mapped = toGraphQLResource(resource({ access: 'PREMIUM' }))

    assert.equal(mapped.url, null)
  })

  it('drops a price left on a resource that is not paid', () => {
    assert.equal(toGraphQLResource(resource({ access: 'FREE', priceCents: 1900 })).priceCents, null)
    assert.equal(toGraphQLResource(resource({ access: 'PREMIUM', priceCents: 1900 })).priceCents, null)
  })

  it('carries a duration for videos and a size for documents', () => {
    const video = toGraphQLResource(
      resource({ type: 'REPLAY', sizeBytes: null, durationMinutes: 58 }),
    )

    assert.equal(video.durationMinutes, 58)
    assert.equal(video.sizeBytes, null)
    assert.equal(toGraphQLResource(resource()).sizeBytes, 921600)
  })

  it('keeps a missing url as null rather than an empty string', () => {
    assert.equal(toGraphQLResource(resource({ url: null })).url, null)
  })
})
