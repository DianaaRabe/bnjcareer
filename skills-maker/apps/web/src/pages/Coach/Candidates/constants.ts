import type { FilterOption } from '@/components/common/FilterControl/FilterControl'
import { ProfileSituation } from '@/gql/graphql'

/** Sentinel for the "no filter" option — never sent to the API. */
export const FILTER_ALL = 'ALL'

export type SituationFilter = ProfileSituation | typeof FILTER_ALL

export const SITUATION_LABEL_IDS: Record<ProfileSituation, string> = {
  [ProfileSituation.Employed]: 'coach.candidates.situation.employed',
  [ProfileSituation.JobSearch]: 'coach.candidates.situation.jobSearch',
  [ProfileSituation.Reconversion]: 'coach.candidates.situation.reconversion',
  [ProfileSituation.Student]: 'coach.candidates.situation.student',
}

// Explicit order — the generated enum is alphabetical, which is not the reading order.
const SITUATION_ORDER = [
  ProfileSituation.JobSearch,
  ProfileSituation.Reconversion,
  ProfileSituation.Employed,
  ProfileSituation.Student,
]

export const SITUATION_OPTIONS: FilterOption<SituationFilter>[] = [
  { value: FILTER_ALL, labelId: 'coach.candidates.filter.all' },
  ...SITUATION_ORDER.map((value) => ({ value, labelId: SITUATION_LABEL_IDS[value] })),
]
