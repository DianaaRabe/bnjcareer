/** Server error codes → message ids. The API returns English strings, never rendered as-is. */
export const SESSION_ERROR_MESSAGE_IDS: Record<string, string> = {
  SESSION_NOT_FOUND: 'coach.sessionDetail.error.notFound',
  SESSION_INVALID: 'coach.sessionDetail.error.invalid',
  default: 'coach.sessionDetail.error.unexpected',
}
