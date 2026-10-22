import { CoachExpertise } from '@/gql/graphql'

export const EXPERTISE_LABEL_IDS: Record<CoachExpertise, string> = {
  [CoachExpertise.CvStrategy]: 'candidate.coaches.expertise.cvStrategy',
  [CoachExpertise.Interview]: 'candidate.coaches.expertise.interview',
  [CoachExpertise.Linkedin]: 'candidate.coaches.expertise.linkedin',
  [CoachExpertise.Negotiation]: 'candidate.coaches.expertise.negotiation',
  [CoachExpertise.CareerChange]: 'candidate.coaches.expertise.careerChange',
  [CoachExpertise.Leadership]: 'candidate.coaches.expertise.leadership',
}

// Explicit order — the generated enum is alphabetical, which is not the reading order.
export const EXPERTISE_ORDER = [
  CoachExpertise.CvStrategy,
  CoachExpertise.Interview,
  CoachExpertise.Linkedin,
  CoachExpertise.Negotiation,
  CoachExpertise.CareerChange,
  CoachExpertise.Leadership,
]
