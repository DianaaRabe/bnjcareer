import gql from 'graphql-tag'

// ─────────────────────────────────────────────────────────────────────────────
// Candidate applications hub.
//
// The unified read model behind "Mes candidatures": every application the candidate
// has, manual or automated, with the delivery/reply tracking that lives on the
// EmailMessage row. ApplicationStatus (coachDashboard) and AutomationStage
// (automation) are GraphQL-global and are reused here, never redefined.
// ─────────────────────────────────────────────────────────────────────────────

export const applicationsTypeDefs = gql`
  "How an application was created: the candidate clicked Apply, or the automation sent it."
  enum ApplicationSource {
    MANUAL
    AUTOMATED
  }

  "Delivery lifecycle of one outgoing application email (skill §13 — tracked apart from the application status)."
  enum EmailDeliveryStatus {
    QUEUED
    SENDING
    SENT
    DELIVERED
    BOUNCED
    FAILED
  }

  "Delivery / reply tracking for an application's outgoing email, present only once an email exists."
  type ApplicationDelivery {
    status: EmailDeliveryStatus!
    "Sending provider (BREVO, GOOGLE, …). Never the recipient address (skill §8)."
    provider: String
    sentAt: String
    deliveredAt: String
    bouncedAt: String
    repliedAt: String
    failedAt: String
  }

  "One application in the candidate's unified history — manual or automated."
  type CandidateApplication {
    id: ID!
    source: ApplicationSource!
    "Candidate/coach tracking status, shared with the dashboard and coach screens."
    status: ApplicationStatus!
    "Automation lifecycle stage; null on manual applications, which have no pipeline."
    stage: AutomationStage
    matchScore: Float
    jobTitle: String!
    company: String
    location: String
    applyUrl: String
    "True once an outgoing email is on record for this application."
    hasEmail: Boolean!
    delivery: ApplicationDelivery
    createdAt: String!
    sentAt: String
    updatedAt: String!
  }

  "Aggregate counters for the applications hub header."
  type CandidateApplicationStats {
    total: Int!
    manual: Int!
    automated: Int!
    sent: Int!
    pending: Int!
    interview: Int!
    rejected: Int!
    "Automated applications prepared and still awaiting the candidate's review."
    awaitingReview: Int!
    "Highest match score across all applications, or null if none has been scored."
    bestMatchScore: Float
  }

  type Query {
    "The signed-in candidate's full application history (manual + automated), newest first, optionally filtered."
    myApplications(source: ApplicationSource, status: ApplicationStatus): [CandidateApplication!]!
    "Aggregate counters across all of the candidate's applications."
    myApplicationStats: CandidateApplicationStats!
  }

  type Mutation {
    "Send one prepared automated application (stage READY_TO_SEND) on the candidate's explicit request. Requires automation to be enabled."
    sendApplication(id: ID!): CandidateApplication!
  }
`
