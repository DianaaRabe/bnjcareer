import { graphql } from '@/gql'

export const UPDATE_AUTOMATION_SETTINGS_MUTATION = graphql(`
  mutation UpdateAutomationSettings($input: UpdateAutomationSettingsInput!) {
    updateAutomationSettings(input: $input) {
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

export const SET_AUTOMATION_ENABLED_MUTATION = graphql(`
  mutation SetAutomationEnabled($enabled: Boolean!) {
    setAutomationEnabled(enabled: $enabled) {
      enabled
      frequency
      nextRunAt
    }
  }
`)

export const CANCEL_PREPARED_APPLICATION_MUTATION = graphql(`
  mutation CancelPreparedApplication($id: ID!) {
    cancelPreparedApplication(id: $id)
  }
`)

export const TRIGGER_MY_AUTOMATION_RUN_MUTATION = graphql(`
  mutation TriggerMyAutomationRun {
    triggerMyAutomationRun {
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

