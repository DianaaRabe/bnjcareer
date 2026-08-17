import { graphql } from '@/gql'

export const MY_COACHING_QUERY = graphql(`
  query MyCoaching {
    myCoaching {
      streakDays
      score {
        points
        max
        percent
      }
      goals {
        key
        points
        done
        progress
      }
      workshops {
        id
        title
        startsAt
        coachName
      }
    }
  }
`)
