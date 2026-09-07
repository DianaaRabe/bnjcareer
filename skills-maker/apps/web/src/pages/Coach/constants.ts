import { EventType } from '@/gql/graphql'

export const EVENT_TYPE_LABEL_IDS: Record<EventType, string> = {
  [EventType.OneOnOne]: 'coach.eventType.oneOnOne',
  [EventType.Group]: 'coach.eventType.group',
}

export const initialsOf = (firstName?: string | null, lastName?: string | null) =>
  [firstName, lastName]
    .map((part) => part?.trim()?.[0] ?? '')
    .join('')
    .toUpperCase()
