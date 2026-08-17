import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildGoals, computeScore, type CoachingSignals } from '../coachingGoals.js'

const NO_ACTIVITY: CoachingSignals = {
  cvStage: 0,
  applicationCount: 0,
  interviewCount: 0,
  attendedWorkshopCount: 0,
  bestMatchScore: null,
}

const goalByKey = (signals: CoachingSignals, key: string) => {
  const goal = buildGoals(signals).find((candidate) => candidate.key === key)
  assert.ok(goal, `missing goal ${key}`)
  return goal
}

describe('buildGoals', () => {
  it('scores a brand new candidate at zero without any goal done', () => {
    const goals = buildGoals(NO_ACTIVITY)

    assert.equal(goals.length, 5)
    assert.ok(goals.every((goal) => !goal.done))
    assert.equal(computeScore(goals).points, 0)
    assert.equal(computeScore(goals).percent, 0)
  })

  it('reports partial progress on measurable goals', () => {
    const goal = goalByKey({ ...NO_ACTIVITY, applicationCount: 2 }, 'APPLICATIONS')

    assert.equal(goal.done, false)
    assert.equal(goal.progress, 40)
  })

  it('drops progress once a measurable goal is reached', () => {
    const goal = goalByKey({ ...NO_ACTIVITY, applicationCount: 5 }, 'APPLICATIONS')

    assert.equal(goal.done, true)
    assert.equal(goal.progress, null)
  })

  it('caps progress at 100 when the candidate overshoots the target', () => {
    const goal = goalByKey({ ...NO_ACTIVITY, bestMatchScore: 200 }, 'MATCHING')

    assert.equal(goal.done, true)
    assert.equal(goal.progress, null)
  })

  it('never exposes progress on all-or-nothing goals', () => {
    const pending = goalByKey(NO_ACTIVITY, 'INTERVIEW')
    const reached = goalByKey({ ...NO_ACTIVITY, interviewCount: 1 }, 'INTERVIEW')

    assert.equal(pending.progress, null)
    assert.equal(pending.done, false)
    assert.equal(reached.done, true)
  })

  it('unlocks the CV goal only once the CV is optimized', () => {
    assert.equal(goalByKey({ ...NO_ACTIVITY, cvStage: 2 }, 'CV').done, false)
    assert.equal(goalByKey({ ...NO_ACTIVITY, cvStage: 2 }, 'CV').progress, 67)
    assert.equal(goalByKey({ ...NO_ACTIVITY, cvStage: 3 }, 'CV').done, true)
  })
})

describe('computeScore', () => {
  it('sums only the completed goals against the full scale', () => {
    const goals = buildGoals({
      cvStage: 3,
      applicationCount: 5,
      interviewCount: 0,
      attendedWorkshopCount: 0,
      bestMatchScore: null,
    })

    const score = computeScore(goals)

    assert.equal(score.points, 80)
    assert.equal(score.max, 220)
    assert.equal(score.percent, 36)
  })

  it('reaches 100 percent when every goal is done', () => {
    const score = computeScore(
      buildGoals({
        cvStage: 3,
        applicationCount: 12,
        interviewCount: 1,
        attendedWorkshopCount: 2,
        bestMatchScore: 88,
      }),
    )

    assert.equal(score.points, score.max)
    assert.equal(score.percent, 100)
  })
})
