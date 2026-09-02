import type { FilterOption } from '@/components/common/FilterControl/FilterControl'
import { CoachExpertise } from '@/gql/graphql'

/** Sentinel for the "no filter" option — never sent to the API. */
export const FILTER_ALL = 'ALL'

export type ExpertiseFilter = CoachExpertise | typeof FILTER_ALL

export const EXPERTISE_LABEL_IDS: Record<CoachExpertise, string> = {
  [CoachExpertise.CvStrategy]: 'candidate.coaches.expertise.cvStrategy',
  [CoachExpertise.Interview]: 'candidate.coaches.expertise.interview',
  [CoachExpertise.Linkedin]: 'candidate.coaches.expertise.linkedin',
  [CoachExpertise.Negotiation]: 'candidate.coaches.expertise.negotiation',
  [CoachExpertise.CareerChange]: 'candidate.coaches.expertise.careerChange',
  [CoachExpertise.Leadership]: 'candidate.coaches.expertise.leadership',
}

// Explicit order — the generated enum is alphabetical, which is not the reading order.
const EXPERTISE_ORDER = [
  CoachExpertise.CvStrategy,
  CoachExpertise.Interview,
  CoachExpertise.Linkedin,
  CoachExpertise.Negotiation,
  CoachExpertise.CareerChange,
  CoachExpertise.Leadership,
]

export const EXPERTISE_OPTIONS: FilterOption<ExpertiseFilter>[] = [
  { value: FILTER_ALL, labelId: 'candidate.coaches.filter.all' },
  ...EXPERTISE_ORDER.map((value) => ({ value, labelId: EXPERTISE_LABEL_IDS[value] })),
]

/** Certifications shown on a card before the rest collapse into a counter. */
export const VISIBLE_CERTIFICATIONS = 2

export const initialsOf = (firstName?: string | null, lastName?: string | null) =>
  [firstName, lastName]
    .map((part) => part?.trim()?.[0] ?? '')
    .join('')
    .toUpperCase()
