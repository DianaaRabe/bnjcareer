export const STATUS_LABEL_IDS = {
  published: 'coach.resources.status.published',
  draft: 'coach.resources.status.draft',
}

export const STATUS_STYLES = {
  published: 'bg-success/10 text-success',
  draft: 'bg-muted text-muted-foreground',
}

/** Server error codes → message ids. The API returns English strings, never rendered as-is. */
export const CREATE_RESOURCE_ERROR_MESSAGE_IDS: Record<string, string> = {
  RESOURCE_INVALID: 'coach.resources.create.error.invalid',
  default: 'coach.resources.create.error.unexpected',
}
