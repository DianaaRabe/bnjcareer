import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { computeStreakDays } from '../coachingStreak.js'

const NOW = new Date('2026-08-15T10:00:00.000Z')

/** Activity timestamp `days` days before NOW. */
const daysAgo = (days: number, hour = 9) =>
  new Date(Date.UTC(2026, 7, 15 - days, hour, 0, 0))

describe('computeStreakDays', () => {
  it('returns 0 without any recorded activity', () => {
    assert.equal(computeStreakDays([], NOW), 0)
  })

  it('counts consecutive days ending today', () => {
    const dates = [daysAgo(0), daysAgo(1), daysAgo(2)]

    assert.equal(computeStreakDays(dates, NOW), 3)
  })

  it('keeps the streak alive when today is still idle', () => {
    const dates = [daysAgo(1), daysAgo(2)]

    assert.equal(computeStreakDays(dates, NOW), 2)
  })

  it('breaks on a fully missed day', () => {
    const dates = [daysAgo(1), daysAgo(3), daysAgo(4)]

    assert.equal(computeStreakDays(dates, NOW), 1)
  })

  it('counts a day once whatever the number of activities on it', () => {
    const dates = [daysAgo(0, 8), daysAgo(0, 14), daysAgo(0, 21), daysAgo(1)]

    assert.equal(computeStreakDays(dates, NOW), 2)
  })

  it('ignores an old streak disconnected from today', () => {
    const dates = [daysAgo(10), daysAgo(11), daysAgo(12)]

    assert.equal(computeStreakDays(dates, NOW), 0)
  })
})
