export const COACHING_GOAL_KEY = {
  cv: 'CV',
  applications: 'APPLICATIONS',
  interview: 'INTERVIEW',
  workshop: 'WORKSHOP',
  matching: 'MATCHING',
} as const

export type CoachingGoalKeyId = (typeof COACHING_GOAL_KEY)[keyof typeof COACHING_GOAL_KEY]

/**
 * Points per goal — the journey scale, their sum is the max score.
 * A product constant: the goal keys are a GraphQL enum and each rule lives in buildGoals(),
 * so adding or scoring a goal is a code change either way. Move to the database only if the
 * scale must become editable without a deploy (per tenant, or from an admin screen).
 */
export const GOAL_POINTS: Record<CoachingGoalKeyId, number> = {
  CV: 50,
  APPLICATIONS: 30,
  INTERVIEW: 80,
  WORKSHOP: 20,
  MATCHING: 40,
}

/** Applications to send before the goal counts as reached. */
export const APPLICATIONS_TARGET = 5

/** Match score (0–100) unlocking the matching goal. */
export const MATCHING_SCORE_TARGET = 75

/** Steps of the CV pipeline: uploaded → extracted → optimized. */
export const CV_STAGES = 3

/** How far back the activity streak is rebuilt. */
export const STREAK_LOOKBACK_DAYS = 365

/** Upcoming workshops returned to the candidate. */
export const UPCOMING_WORKSHOPS_LIMIT = 10
