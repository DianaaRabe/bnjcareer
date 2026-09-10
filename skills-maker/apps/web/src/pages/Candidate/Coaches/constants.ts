import type { FilterOption } from '@/components/common/FilterControl/FilterControl'
import { EXPERTISE_LABEL_IDS, EXPERTISE_ORDER } from '@/constants/coaches'
import { CoachExpertise } from '@/gql/graphql'

export { EXPERTISE_LABEL_IDS }

/** Sentinel for the "no filter" option — never sent to the API. */
export const FILTER_ALL = 'ALL'

export type ExpertiseFilter = CoachExpertise | typeof FILTER_ALL

export const EXPERTISE_OPTIONS: FilterOption<ExpertiseFilter>[] = [
  { value: FILTER_ALL, labelId: 'candidate.coaches.filter.all' },
  ...EXPERTISE_ORDER.map((value) => ({ value, labelId: EXPERTISE_LABEL_IDS[value] })),
]

/** Certifications shown on a card before the rest collapse into a counter. */
export const VISIBLE_CERTIFICATIONS = 2
