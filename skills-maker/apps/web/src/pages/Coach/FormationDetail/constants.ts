/** Server error codes → message ids. The API returns English strings, never rendered as-is. */
export const FORMATION_ERROR_MESSAGE_IDS: Record<string, string> = {
  TRAINING_NOT_FOUND: 'coach.formationDetail.error.notFound',
  TRAINING_INVALID: 'coach.formationDetail.error.invalid',
  default: 'coach.formationDetail.error.unexpected',
}

export const MODULE_ERROR_MESSAGE_IDS: Record<string, string> = {
  TRAINING_MODULE_INVALID: 'coach.formationDetail.curriculum.error.invalid',
  TRAINING_MODULE_NOT_FOUND: 'coach.formationDetail.curriculum.error.notFound',
  default: 'coach.formationDetail.curriculum.error.unexpected',
}
