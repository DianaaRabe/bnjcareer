import { graphql } from '@/gql'

export const MY_AUTOMATION_SETTINGS_QUERY = graphql(`
  query MyAutomationSettings {
    myAutomationSettings {
      enabled
      frequency
      nextRunAt
      maxApplicationsPerRun
      maxApplicationsPerDay
      minMatchScore
      approvalMode
      keywords
      locations
      contractTypes
      ceilings {
        maxApplicationsPerRun
        maxApplicationsPerDay
        minMatchScore
      }
      defaults {
        maxApplicationsPerRun
        maxApplicationsPerDay
        minMatchScore
      }
    }
  }
`)

export const MY_AUTOMATION_RUNS_QUERY = graphql(`
  query MyAutomationRuns($limit: Int) {
    myAutomationRuns(limit: $limit) {
      id
      status
      startedAt
      completedAt
      jobsDiscovered
      jobsMatched
      applicationsPrepared
      failures
    }
  }
`)

export const MY_PREPARED_APPLICATIONS_QUERY = graphql(`
  query MyPreparedApplications {
    myPreparedApplications {
      id
      stage
      matchScore
      jobTitle
      company
      location
      applyUrl
      hasContact
      recipientEmail
      coverLetter
      createdAt
    }
  }
`)
