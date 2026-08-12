import gql from 'graphql-tag'

export const jobsTypeDefs = gql`
  enum JobSource {
    INDEED
    LINKEDIN
    HELLOWORK
    FRANCE_TRAVAIL
    JOOBLE
  }

  enum SalaryPeriod {
    HOUR
    MONTH
    YEAR
  }

  "Shared filter vocabulary — each provider translates it into its own API wording."
  enum ContractType {
    PERMANENT
    FIXED_TERM
    APPRENTICESHIP
    INTERNSHIP
    TEMPORARY
    FREELANCE
    SEASONAL
  }

  enum ExperienceLevel {
    ENTRY
    JUNIOR
    SENIOR
  }

  enum WorkTime {
    FULL_TIME
    PART_TIME
  }

  enum PostedWithin {
    DAY
    THREE_DAYS
    WEEK
    MONTH
  }

  "Filters a given source can actually honour — the client hides the others."
  enum JobFilterKind {
    CONTRACT_TYPE
    EXPERIENCE_LEVEL
    WORK_TIME
    POSTED_WITHIN
  }

  type JobSourceInfo {
    id: JobSource!
    supportedFilters: [JobFilterKind!]!
  }

  type JobSalary {
    "Raw label published by the source — always displayable."
    label: String!
    "Structured values, extracted best-effort from the label; null when unparseable."
    min: Float
    max: Float
    currency: String
    period: SalaryPeriod
  }

  type Job {
    id: ID!
    source: JobSource!
    title: String!
    company: String
    location: String!
    description: String!
    applyUrl: String!
    "ISO 8601 publication date, when the source provides one."
    postedAt: String
    salary: JobSalary
    "Contract type, experience level, sector… as published by the source."
    tags: [String!]!
    isRemote: Boolean!
  }

  type JobSearchResult {
    source: JobSource!
    jobs: [Job!]!
    "Total matches upstream — may exceed the returned page."
    total: Int
  }

  input SearchJobsInput {
    source: JobSource!
    keywords: String
    location: String
    limit: Int
    contractTypes: [ContractType!]
    experienceLevel: ExperienceLevel
    workTime: WorkTime
    postedWithin: PostedWithin
  }

  type Query {
    "Sources configured server-side, with the filters each one supports."
    jobSources: [JobSourceInfo!]!
    searchJobs(input: SearchJobsInput!): JobSearchResult!
  }
`
