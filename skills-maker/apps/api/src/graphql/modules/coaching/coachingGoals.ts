import {
  APPLICATIONS_TARGET,
  COACHING_GOAL_KEY,
  CV_STAGES,
  GOAL_POINTS,
  MATCHING_SCORE_TARGET,
  type CoachingGoalKeyId,
} from './coachingConstants.js'

/** Raw counters read from the database, before any scoring rule is applied. */
export type CoachingSignals = {
  /** Progress through the CV pipeline: 0 none, 1 uploaded, 2 extracted, 3 optimized. */
  cvStage: number
  applicationCount: number
  interviewCount: number
  attendedWorkshopCount: number
  /** Best match score recorded so far (0–100), null when nothing was analyzed yet. */
  bestMatchScore: number | null
}

export type CoachingGoal = {
  key: CoachingGoalKeyId
  points: number
  done: boolean
  /** Completion 0–100 while in progress, null once done or when the goal is all-or-nothing. */
  progress: number | null
}

const percentOf = (value: number, target: number) =>
  target <= 0 ? 0 : Math.max(0, Math.min(100, Math.round((value / target) * 100)))

const measurable = (key: CoachingGoalKeyId, value: number, target: number): CoachingGoal => {
  const done = value >= target
  return { key, points: GOAL_POINTS[key], done, progress: done ? null : percentOf(value, target) }
}

const allOrNothing = (key: CoachingGoalKeyId, reached: boolean): CoachingGoal => ({
  key,
  points: GOAL_POINTS[key],
  done: reached,
  progress: null,
})

export const buildGoals = (signals: CoachingSignals): CoachingGoal[] => [
  measurable(COACHING_GOAL_KEY.cv, signals.cvStage, CV_STAGES),
  measurable(COACHING_GOAL_KEY.applications, signals.applicationCount, APPLICATIONS_TARGET),
  allOrNothing(COACHING_GOAL_KEY.interview, signals.interviewCount > 0),
  allOrNothing(COACHING_GOAL_KEY.workshop, signals.attendedWorkshopCount > 0),
  measurable(COACHING_GOAL_KEY.matching, signals.bestMatchScore ?? 0, MATCHING_SCORE_TARGET),
]

export const computeScore = (goals: CoachingGoal[]) => {
  const max = goals.reduce((total, goal) => total + goal.points, 0)
  const points = goals.reduce((total, goal) => (goal.done ? total + goal.points : total), 0)
  return { points, max, percent: max === 0 ? 0 : Math.round((points / max) * 100) }
}
