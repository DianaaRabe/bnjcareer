import type { FilterOption } from '@/components/common/FilterControl/FilterControl'
import { EventType } from '@/gql/graphql'
import { EVENT_TYPE_LABEL_IDS } from '../constants'

export const FILTER_ALL = 'ALL' as const
export type TypeFilter = EventType | typeof FILTER_ALL

export const TYPE_ORDER: EventType[] = [EventType.OneOnOne, EventType.Group]

export const TYPE_OPTIONS: FilterOption<TypeFilter>[] = [
  { value: FILTER_ALL, labelId: 'coach.sessions.filter.all' },
  ...TYPE_ORDER.map((value) => ({ value, labelId: EVENT_TYPE_LABEL_IDS[value] })),
]

export const DEFAULT_DURATION_MINUTES = 60

/** Server error codes → message ids. The API returns English strings, never rendered as-is. */
export const CREATE_SESSION_ERROR_MESSAGE_IDS: Record<string, string> = {
  SESSION_INVALID: 'coach.sessions.create.error.invalid',
  default: 'coach.sessions.create.error.unexpected',
}
