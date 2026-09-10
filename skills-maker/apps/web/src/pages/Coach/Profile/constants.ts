import type { FilterOption } from '@/components/common/FilterControl/FilterControl'
import { EXPERTISE_LABEL_IDS, EXPERTISE_ORDER } from '@/constants/coaches'
import type { CoachExpertise } from '@/gql/graphql'

export const EXPERTISE_OPTIONS: FilterOption<CoachExpertise>[] = EXPERTISE_ORDER.map((value) => ({
  value,
  labelId: EXPERTISE_LABEL_IDS[value],
}))

export const MAX_BIO_LENGTH = 500
export const MAX_CERTIFICATIONS = 8

/** Server error codes → message ids. The API returns English strings, never rendered as-is. */
export const SAVE_ERROR_MESSAGE_IDS: Record<string, string> = {
  COACH_PROFILE_INVALID: 'coach.profile.save.error.invalidInput',
  default: 'coach.profile.save.error.unexpected',
}
