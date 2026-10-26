import { graphql } from '@/gql'

// Sends one prepared automated application. The selection mirrors the MyApplications list item so
// Apollo normalizes the result onto the existing cache entry (same id) — the card flips to SENT
// without a list refetch. Aggregate counters are refreshed separately by the caller.
export const SEND_APPLICATION_MUTATION = graphql(`
  mutation SendApplication($id: ID!) {
    sendApplication(id: $id) {
      id
      source
      status
      stage
      matchScore
      jobTitle
      company
      location
      applyUrl
      hasEmail
      delivery {
        status
        provider
        sentAt
        deliveredAt
        bouncedAt
        repliedAt
        failedAt
      }
      createdAt
      sentAt
      updatedAt
    }
  }
`)
