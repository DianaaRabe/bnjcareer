import { EventStatus, EventType, ProfileSituation } from '@/gql/graphql'

export const EVENT_TYPE_LABEL_IDS: Record<EventType, string> = {
  [EventType.OneOnOne]: 'coach.eventType.oneOnOne',
  [EventType.Group]: 'coach.eventType.group',
}

export const EVENT_STATUS_LABEL_IDS: Record<EventStatus, string> = {
  [EventStatus.Scheduled]: 'coach.eventStatus.scheduled',
  [EventStatus.Canceled]: 'coach.eventStatus.canceled',
}

export const EVENT_STATUS_STYLES: Record<EventStatus, string> = {
  [EventStatus.Scheduled]: 'bg-success/10 text-success',
  [EventStatus.Canceled]: 'bg-muted text-muted-foreground',
}

export const SITUATION_LABEL_IDS: Record<ProfileSituation, string> = {
  [ProfileSituation.Employed]: 'coach.candidates.situation.employed',
  [ProfileSituation.JobSearch]: 'coach.candidates.situation.jobSearch',
  [ProfileSituation.Reconversion]: 'coach.candidates.situation.reconversion',
  [ProfileSituation.Student]: 'coach.candidates.situation.student',
}
