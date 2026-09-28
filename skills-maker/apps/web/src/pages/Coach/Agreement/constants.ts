/** Server error codes → message ids. The API returns English strings, never rendered as-is. */
export const AGREEMENT_ERROR_MESSAGE_IDS: Record<string, string> = {
  COACH_AGREEMENT_INVALID: 'coach.agreement.error.invalidName',
  COACH_AGREEMENT_OUTDATED: 'coach.agreement.error.outdated',
  FORBIDDEN: 'coach.agreement.error.forbidden',
  default: 'coach.agreement.error.unexpected',
}

/** Mirrors MIN_SIGNED_NAME_LENGTH in the API — the button stays disabled below it. */
export const MIN_SIGNED_NAME_LENGTH = 3
