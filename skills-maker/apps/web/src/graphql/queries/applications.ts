import { graphql } from '@/gql'

export const MY_APPLICATIONS_QUERY = graphql(`
  query MyApplications($source: ApplicationSource, $status: ApplicationStatus) {
    myApplications(source: $source, status: $status) {
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

export const MY_APPLICATION_STATS_QUERY = graphql(`
  query MyApplicationStats {
    myApplicationStats {
      total
      manual
      automated
      sent
      pending
      interview
      rejected
      awaitingReview
      bestMatchScore
    }
  }
`)
