import { graphql } from '@/gql'

export const RESOURCES_QUERY = graphql(`
  query Resources {
    resources {
      id
      title
      description
      type
      category
      url
      sizeBytes
      durationMinutes
      access
      priceCents
    }
  }
`)
