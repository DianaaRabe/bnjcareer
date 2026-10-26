/** Server error codes → message ids. The API returns English strings, never rendered as-is. */
export const TRAINING_ERROR_MESSAGE_IDS: Record<string, string> = {
  TRAINING_NOT_FOUND: 'candidate.trainingDetail.error.notFound',
  default: 'candidate.trainingDetail.error.unexpected',
}

const MINUTES_PER_HOUR = 60

/** Hours read better past an hour — minutes stay below, and for uneven values. */
export const moduleDurationMessage = (durationMinutes: number) =>
  durationMinutes >= MINUTES_PER_HOUR && durationMinutes % MINUTES_PER_HOUR === 0
    ? { id: 'candidate.trainingDetail.duration.hours', count: durationMinutes / MINUTES_PER_HOUR }
    : { id: 'candidate.trainingDetail.duration.minutes', count: durationMinutes }
