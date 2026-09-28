import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Context } from '@/context.js'
import { getMyCoachProfile, updateCoachProfile } from '../coachesProfileService.js'

const profileRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'coach-profile-1',
  userId: 'coach-1',
  specialty: 'Leadership & Négociation',
  yearsExperience: 8,
  certifications: ['ICF'],
  expertise: ['LEADERSHIP'],
  rating: 4.8,
  acceptingClients: true,
  published: true,
  createdAt: new Date(),
  ...overrides,
})

type WriteArgs = { data?: Record<string, unknown>; create?: Record<string, unknown>; update?: Record<string, unknown> }

type Calls = {
  findUnique: Record<string, unknown>[]
  upsert: WriteArgs[]
}

const contextWith = (fixture: { profile?: Record<string, unknown> | null; upsertedProfile?: Record<string, unknown> }) => {
  const calls: Calls = { findUnique: [], upsert: [] }

  const prisma = {
    coachProfile: {
      findUnique: async (args: Record<string, unknown>) => {
        calls.findUnique.push(args)
        return fixture.profile ?? null
      },
      upsert: async (args: WriteArgs) => {
        calls.upsert.push(args)
        return fixture.upsertedProfile ?? profileRow()
      },
    },
  }

  return { ctx: { prisma, user: null } as unknown as Context, calls }
}

describe('getMyCoachProfile', () => {
  it('returns model defaults when the coach never saved a profile yet', async () => {
    const { ctx } = contextWith({ profile: null })

    const profile = await getMyCoachProfile(ctx, 'coach-1')

    assert.deepEqual(profile, {
      specialty: null,
      yearsExperience: null,
      certifications: [],
      expertise: [],
      rating: null,
      acceptingClients: true,
      published: true,
    })
  })

  it('maps an existing row, published included', async () => {
    const { ctx } = contextWith({ profile: profileRow({ published: false }) })

    const profile = await getMyCoachProfile(ctx, 'coach-1')

    assert.equal(profile.specialty, 'Leadership & Négociation')
    assert.equal(profile.published, false)
  })
})

describe('updateCoachProfile', () => {
  it('rejects an invalid input', async () => {
    const { ctx } = contextWith({})

    await assert.rejects(
      () => updateCoachProfile(ctx, 'coach-1', { yearsExperience: -1 }),
      /Invalid coach profile data/,
    )
  })

  it('provisions the row on the first save', async () => {
    const { ctx, calls } = contextWith({})

    await updateCoachProfile(ctx, 'coach-1', { specialty: 'CV & Entretien' })

    assert.deepEqual(calls.upsert[0]?.create, { userId: 'coach-1', specialty: 'CV & Entretien' })
  })

  it('leaves omitted fields untouched on update', async () => {
    const { ctx, calls } = contextWith({})

    await updateCoachProfile(ctx, 'coach-1', { acceptingClients: false })

    assert.deepEqual(calls.upsert[0]?.update, { acceptingClients: false })
  })
})
