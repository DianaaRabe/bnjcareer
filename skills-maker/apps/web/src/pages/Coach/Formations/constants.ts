export const STATUS_LABEL_IDS = {
  published: 'coach.formations.status.published',
  draft: 'coach.formations.status.draft',
}

export const STATUS_STYLES = {
  published: 'bg-success/10 text-success',
  draft: 'bg-muted text-muted-foreground',
}

/** Server error codes → message ids. The API returns English strings, never rendered as-is. */
export const CREATE_TRAINING_ERROR_MESSAGE_IDS: Record<string, string> = {
  TRAINING_INVALID: 'coach.formations.create.error.invalid',
  default: 'coach.formations.create.error.unexpected',
}

export const MIN_DURATION_DAYS = 1
