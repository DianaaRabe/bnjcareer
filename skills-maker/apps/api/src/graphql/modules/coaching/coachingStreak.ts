const DAY_MS = 24 * 60 * 60 * 1000

/** UTC day key — keeps the streak stable regardless of the server timezone. */
const dayKey = (date: Date) => date.toISOString().slice(0, 10)

/**
 * Consecutive days, ending today, carrying at least one recorded activity.
 * An idle today does not break the streak (it is still in progress), a full missed day does.
 */
export function computeStreakDays(activityDates: Date[], now = new Date()): number {
  if (activityDates.length === 0) {
    return 0
  }

  const activeDays = new Set(activityDates.map(dayKey))
  const todayStart = Date.parse(dayKey(now))

  let cursor = activeDays.has(dayKey(now)) ? todayStart : todayStart - DAY_MS
  let streak = 0

  while (activeDays.has(dayKey(new Date(cursor)))) {
    streak += 1
    cursor -= DAY_MS
  }

  return streak
}
