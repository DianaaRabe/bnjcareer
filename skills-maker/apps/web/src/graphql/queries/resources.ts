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

export const COACH_RESOURCES_QUERY = graphql(`
  query CoachResources {
    coachResources {
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
      published
    }
  }
`)

export const COACH_RESOURCE_QUERY = graphql(`
  query CoachResource($id: ID!) {
    coachResource(id: $id) {
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
      published
    }
  }
`)
