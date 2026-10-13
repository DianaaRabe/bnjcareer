import gql from 'graphql-tag'

export const automationTypeDefs = gql`
  enum AutomationFrequency {
    DAILY
    WEEKLY
  }

  enum AutomationRunStatus {
    RUNNING
    COMPLETED
    PARTIAL
    FAILED
  }

  "Automation lifecycle stage of one prepared application (skill §13)."
  enum AutomationStage {
    DISCOVERED
    MATCHED
    ELIGIBLE
    PREPARING
    READY_TO_SEND
    SENDING
    SENT
    CANCELLED
  }

  "Server-owned volume ceiling / default set. The candidate configures a preference; the server owns the cap (skill §16)."
  type AutomationBounds {
    maxApplicationsPerRun: Int!
    maxApplicationsPerDay: Int!
    minMatchScore: Int!
  }

  "A candidate's effective automation configuration. All numeric values are already resolved and clamped server-side."
  type AutomationSettings {
    "False until the candidate explicitly enables automation (skill §25) — a missing row reads as disabled, never as implied consent."
    enabled: Boolean!
    frequency: AutomationFrequency!
    "ISO 8601 time the next run is due, or null while automation is disabled."
    nextRunAt: String
    "Effective (clamped) ceilings in force for this candidate."
    maxApplicationsPerRun: Int!
    maxApplicationsPerDay: Int!
    minMatchScore: Int!
    "True prepares applications for the candidate to review; false would send without review."
    approvalMode: Boolean!
    keywords: [String!]!
    locations: [String!]!
    contractTypes: [String!]!
    "The absolute server ceilings, so the UI can show the cap it clamps to."
    ceilings: AutomationBounds!
    "The server defaults applied when the candidate leaves a field unset."
    defaults: AutomationBounds!
  }

  "One automation execution, redacted to aggregate counters only (skill §27)."
  type AutomationRunSummary {
    id: ID!
    status: AutomationRunStatus!
    startedAt: String!
    completedAt: String
    jobsDiscovered: Int!
    jobsMatched: Int!
    "Applications prepared this run. Until the send phase lands, 'prepared' is the real work done."
    applicationsPrepared: Int!
    failures: Int!
  }

  "An automated application awaiting the candidate's review. Only the candidate's own data is exposed."
  type PreparedApplication {
    id: ID!
    stage: AutomationStage!
    matchScore: Float
    jobTitle: String!
    company: String
    location: String
    applyUrl: String
    "Whether a recipient contact was resolved."
    hasContact: Boolean!
    "The resolved recipient address, shown so the candidate can review it before deciding to send (own data only)."
    recipientEmail: String
    "The generated cover letter — the candidate's own data, shown so they can review before it is sent."
    coverLetter: String
    createdAt: String!
  }

  "Preference changes only. This input can neither enable automation nor raise a ceiling past the server cap."
  input UpdateAutomationSettingsInput {
    frequency: AutomationFrequency
    maxApplicationsPerRun: Int
    maxApplicationsPerDay: Int
    minMatchScore: Int
    approvalMode: Boolean
    keywords: [String!]
    locations: [String!]
    contractTypes: [String!]
  }

  type Query {
    "The signed-in candidate's effective automation settings, with the server ceilings and defaults."
    myAutomationSettings: AutomationSettings!
    "The candidate's most recent automation runs (redacted counters only)."
    myAutomationRuns(limit: Int): [AutomationRunSummary!]!
    "Automated applications prepared for the candidate and still awaiting review."
    myPreparedApplications: [PreparedApplication!]!
  }

  type Mutation {
    "Updates automation preferences. Does NOT enable automation — enabling is a separate explicit action (skill §25)."
    updateAutomationSettings(input: UpdateAutomationSettingsInput!): AutomationSettings!
    "The explicit opt-in / opt-out. Enabling schedules the first run; disabling clears the schedule."
    setAutomationEnabled(enabled: Boolean!): AutomationSettings!
    "Cancels a prepared application the candidate does not want sent. Candidate-scoped: only the owner can cancel."
    cancelPreparedApplication(id: ID!): Boolean!
  }
`
