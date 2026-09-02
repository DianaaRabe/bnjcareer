import assert from 'node:assert/strict'
import { describe, it, mock } from 'node:test'
import type { Context } from '@/context.js'
import { getProfileByUserId, updateProfile } from '../profileService.js'

function buildContext(profile: Partial<Context['prisma']['profile']>): Context {
  return {
    prisma: { profile } as unknown as Context['prisma'],
    user: null,
    audit: { ipAddress: null, userAgent: null },
  }
}

const baseProfile = {
  id: 'p1',
  userId: 'u1',
  firstName: null,
  lastName: null,
  phone: null,
  bio: null,
  avatarUrl: null,
  birthDate: null,
  educationLevel: null,
  school: null,
  sector: null,
  situation: null,
  strengths: [] as string[],
  improvements: [] as string[],
  skills: [] as string[],
  objective: null,
  createdAt: new Date(),
}

describe('profileService', () => {
  it('getProfileByUserId reads by userId', async () => {
    const findUnique = mock.fn(async (_args: { where: { userId: string } }) => ({
      ...baseProfile,
      firstName: 'Ada',
    }))
    const ctx = buildContext({ findUnique: findUnique as never })

    const result = await getProfileByUserId(ctx, 'u1')

    assert.equal(findUnique.mock.calls.length, 1)
    assert.deepEqual(findUnique.mock.calls[0].arguments[0], { where: { userId: 'u1' } })
    assert.equal(result?.firstName, 'Ada')
  })

  it('updateProfile rejects invalid input without touching Prisma', async () => {
    const update = mock.fn()
    const ctx = buildContext({ update: update as never })

    await assert.rejects(() => updateProfile(ctx, 'u1', { firstName: '' }), /Invalid profile data/)
    assert.equal(update.mock.calls.length, 0)
  })

  it('updateProfile rejects more than 3 strengths', async () => {
    const update = mock.fn()
    const ctx = buildContext({ update: update as never })

    await assert.rejects(
      () => updateProfile(ctx, 'u1', { strengths: ['a', 'b', 'c', 'd'] }),
      /Invalid profile data/,
    )
    assert.equal(update.mock.calls.length, 0)
  })

  it('updateProfile rejects an unknown situation value', async () => {
    const update = mock.fn()
    const ctx = buildContext({ update: update as never })

    await assert.rejects(() => updateProfile(ctx, 'u1', { situation: 'not_a_value' }), /Invalid profile data/)
    assert.equal(update.mock.calls.length, 0)
  })

  it('updateProfile writes only the parsed fields', async () => {
    const update = mock.fn(
      async (_args: { where: { userId: string }; data: Record<string, unknown> }) => ({
        ...baseProfile,
        firstName: 'Ada',
        lastName: 'Lovelace',
      }),
    )
    const ctx = buildContext({ update: update as never })

    const result = await updateProfile(ctx, 'u1', { firstName: 'Ada', lastName: 'Lovelace' })

    assert.deepEqual(update.mock.calls[0].arguments[0], {
      where: { userId: 'u1' },
      data: { firstName: 'Ada', lastName: 'Lovelace' },
    })
    assert.equal(result.lastName, 'Lovelace')
  })

  it('updateProfile allows clearing a field with null', async () => {
    const update = mock.fn(
      async (_args: { where: { userId: string }; data: Record<string, unknown> }) => ({
        ...baseProfile,
      }),
    )
    const ctx = buildContext({ update: update as never })

    await updateProfile(ctx, 'u1', { bio: null })

    assert.deepEqual(update.mock.calls[0].arguments[0].data, { bio: null })
  })

  it('updateProfile converts an ISO birthDate into a Date and passes enums/arrays through', async () => {
    const update = mock.fn(
      async (_args: { where: { userId: string }; data: Record<string, unknown> }) => ({
        ...baseProfile,
        situation: 'RECONVERSION',
      }),
    )
    const ctx = buildContext({ update: update as never })

    await updateProfile(ctx, 'u1', {
      birthDate: '1998-05-20',
      situation: 'RECONVERSION',
      strengths: ['Analyse', 'Communication'],
      objective: 'CAREER_CHANGE',
    })

    const data = update.mock.calls[0].arguments[0].data as Record<string, unknown>
    assert.ok(data.birthDate instanceof Date)
    assert.equal((data.birthDate as Date).toISOString().slice(0, 10), '1998-05-20')
    assert.equal(data.situation, 'RECONVERSION')
    assert.deepEqual(data.strengths, ['Analyse', 'Communication'])
    assert.equal(data.objective, 'CAREER_CHANGE')
  })
})
