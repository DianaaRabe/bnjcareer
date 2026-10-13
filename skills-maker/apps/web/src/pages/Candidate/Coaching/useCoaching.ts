import { useMemo } from 'react'

import { useMyCoachingQuery } from '@/graphql/hooks/coaching'
import type { CoachingGoalKey } from '@/gql/graphql'
import { GOAL_LABEL_IDS, scoreLevelId } from './constants'

export type Goal = {
  key: CoachingGoalKey
  labelId: string
  points: number
  done: boolean
  /** Completion 0–100, absent on all-or-nothing goals and on completed ones. */
  progress?: number
}

export type Workshop = {
  id: string
  title: string
  /** ISO datetime — formatted at render time, the API stays locale-agnostic. */
  startsAt: string
  coachName?: string
}

const EMPTY_SCORE = { points: 0, max: 0, percent: 0 }

export const useCoaching = () => {
  const { data, loading, error, refetch } = useMyCoachingQuery()

  const overview = data?.myCoaching

  const goals: Goal[] = useMemo(
    () =>
      (overview?.goals ?? []).map((goal) => ({
        key: goal.key,
        labelId: GOAL_LABEL_IDS[goal.key],
        points: goal.points,
        done: goal.done,
        progress: goal.progress ?? undefined,
      })),
    [overview],
  )

  const workshops: Workshop[] = useMemo(
    () =>
      (overview?.workshops ?? []).map((workshop) => ({
        id: workshop.id,
        title: workshop.title,
        startsAt: workshop.startsAt,
        coachName: workshop.coachName ?? undefined,
      })),
    [overview],
  )

  const score = overview?.score ?? EMPTY_SCORE

  return {
    workshops,
    goals,
    score: { points: score.points, max: score.max, levelId: scoreLevelId(score.percent) },
    scorePercent: score.percent,
    streakDays: overview?.streakDays ?? 0,
    isLoading: loading,
    hasError: Boolean(error),
    retry: () => void refetch(),
  }
}
