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

export const TRAINING_QUERY = graphql(`
  query Training($id: ID!) {
    training(id: $id) {
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
      curriculum {
        id
        position
        title
        summary
        durationMinutes
      }
    }
  }
`)
