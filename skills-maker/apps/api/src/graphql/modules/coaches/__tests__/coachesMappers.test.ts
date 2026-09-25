import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { toGraphQLCoach, type CoachRecord } from '../coachesMappers.js'

const coach = (overrides: Record<string, unknown> = {}, profile: Record<string, unknown> | null = {}) =>
  ({
    id: 'coach-profile-1',
    userId: 'user-1',
    specialty: 'Leadership & Négociation',
    yearsExperience: 12,
    certifications: ['Coach Professionnel RNCP'],
    expertise: ['LEADERSHIP', 'NEGOTIATION'],
    rating: 4.9,
    acceptingClients: true,
    published: true,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    ...overrides,
    user: {
      id: 'user-1',
      email: 'thomas@bnj.dev',
      role: 'COACH',
      profile:
        profile === null
          ? null
          : {
              firstName: 'Thomas',
              lastName: 'Dubois',
              avatarUrl: null,
              bio: 'Ancien DRH reconverti en coach.',
              ...profile,
            },
    },
  }) as unknown as CoachRecord

describe('toGraphQLCoach', () => {
  it('merges the shared profile with the coaching data', () => {
    assert.deepEqual(toGraphQLCoach(coach()), {
      id: 'user-1',
      firstName: 'Thomas',
      lastName: 'Dubois',
      avatarUrl: null,
      bio: 'Ancien DRH reconverti en coach.',
      specialty: 'Leadership & Négociation',
      yearsExperience: 12,
      certifications: ['Coach Professionnel RNCP'],
      expertise: ['LEADERSHIP', 'NEGOTIATION'],
      rating: 4.9,
      acceptingClients: true,
    })
  })

  it('exposes the user id, not the coach profile id — that is what a booking references', () => {
    assert.equal(toGraphQLCoach(coach()).id, 'user-1')
  })

  it('never leaks the account or catalog-management fields', () => {
    const mapped = toGraphQLCoach(coach()) as Record<string, unknown>

    assert.equal('email' in mapped, false)
    assert.equal('published' in mapped, false)
    assert.equal('createdAt' in mapped, false)
    assert.equal('userId' in mapped, false)
  })

  it('survives a coach without a profile row', () => {
    const mapped = toGraphQLCoach(coach({}, null))

    assert.equal(mapped.firstName, null)
    assert.equal(mapped.lastName, null)
    assert.equal(mapped.bio, null)
    assert.equal(mapped.specialty, 'Leadership & Négociation')
  })

  it('keeps an unrated coach as null rather than zero', () => {
    assert.equal(toGraphQLCoach(coach({ rating: null })).rating, null)
  })

  it('reports a coach closed to new candidates', () => {
    assert.equal(toGraphQLCoach(coach({ acceptingClients: false })).acceptingClients, false)
  })

  it('defaults empty lists to empty arrays, never null', () => {
    const mapped = toGraphQLCoach(coach({ certifications: [], expertise: [] }))

    assert.deepEqual(mapped.certifications, [])
    assert.deepEqual(mapped.expertise, [])
  })
})
