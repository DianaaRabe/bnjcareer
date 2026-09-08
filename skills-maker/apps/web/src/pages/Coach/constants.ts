import { EventType, ProfileSituation } from '@/gql/graphql'

export const EVENT_TYPE_LABEL_IDS: Record<EventType, string> = {
  [EventType.OneOnOne]: 'coach.eventType.oneOnOne',
  [EventType.Group]: 'coach.eventType.group',
}

export const SITUATION_LABEL_IDS: Record<ProfileSituation, string> = {
  [ProfileSituation.Employed]: 'coach.candidates.situation.employed',
  [ProfileSituation.JobSearch]: 'coach.candidates.situation.jobSearch',
  [ProfileSituation.Reconversion]: 'coach.candidates.situation.reconversion',
  [ProfileSituation.Student]: 'coach.candidates.situation.student',
}
