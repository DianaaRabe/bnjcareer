/** Server error codes → message ids. The API returns English strings, never rendered as-is. */
export const RESOURCE_ERROR_MESSAGE_IDS: Record<string, string> = {
  RESOURCE_NOT_FOUND: 'coach.resourceDetail.error.notFound',
  RESOURCE_INVALID: 'coach.resourceDetail.error.invalid',
  default: 'coach.resourceDetail.error.unexpected',
}
