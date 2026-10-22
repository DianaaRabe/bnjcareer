import { CoachingGoalKey } from '@/gql/graphql'

/** Goal key → translation key. Points, completion and ordering come from the API. */
export const GOAL_LABEL_IDS: Record<CoachingGoalKey, string> = {
  [CoachingGoalKey.Cv]: 'candidate.coaching.goals.cv',
  [CoachingGoalKey.Applications]: 'candidate.coaching.goals.applications',
  [CoachingGoalKey.Interview]: 'candidate.coaching.goals.interview',
  [CoachingGoalKey.Workshop]: 'candidate.coaching.goals.workshop',
  [CoachingGoalKey.Matching]: 'candidate.coaching.goals.matching',
}

/** Level wording thresholds, expressed as a share of the max score. */
export const SCORE_LEVELS = [
  { min: 75, labelId: 'candidate.coaching.level.expert' },
  { min: 50, labelId: 'candidate.coaching.level.advanced' },
  { min: 25, labelId: 'candidate.coaching.level.intermediate' },
  { min: 0, labelId: 'candidate.coaching.level.beginner' },
] as const

export const scoreLevelId = (percent: number) =>
  SCORE_LEVELS.find(({ min }) => percent >= min)?.labelId ?? SCORE_LEVELS[SCORE_LEVELS.length - 1].labelId
