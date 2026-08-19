import { graphql } from '@/gql'

export const TRAININGS_QUERY = graphql(`
  query Trainings {
    trainings {
      id
      title
      description
      category
      level
      priceCents
      modules
      durationDays
      instructor
      certificate
    }
  }
`)
