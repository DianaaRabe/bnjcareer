import gql from 'graphql-tag'

export const sessionsTypeDefs = gql`
  enum EventStatus {
    SCHEDULED
    CANCELED
  }

  enum BookingStatus {
    BOOKED
    CANCELED
  }

  type SessionAttendee {
    "The booking id — target of cancelBooking."
    id: ID!
    firstName: String
    lastName: String
    avatarUrl: String
    status: BookingStatus!
  }

  type CoachSession {
    id: ID!
    title: String!
    type: EventType!
    status: EventStatus!
    "ISO 8601 datetime."
    startTime: String!
    "ISO 8601 datetime."
    endTime: String!
    "Candidates with an active (non-canceled) booking on this session."
    attendeesCount: Int!
    "Only resolved on the detail query."
    attendees: [SessionAttendee!]!
  }

  input CreateSessionInput {
    title: String!
    type: EventType!
    startTime: String!
    endTime: String!
  }

  input UpdateSessionInput {
    title: String
    type: EventType
    startTime: String
    endTime: String
  }

  type Query {
    "The authenticated coach's own sessions, latest start time first."
    mySessions: [CoachSession!]!
    "One of the authenticated coach's own sessions, with its attendees."
    mySession(id: ID!): CoachSession!
  }

  type Mutation {
    "Creates a session owned by the authenticated coach."
    createSession(input: CreateSessionInput!): CoachSession!
    "Updates a session owned by the authenticated coach — omitted fields are left untouched."
    updateSession(id: ID!, input: UpdateSessionInput!): CoachSession!
    "Marks a session owned by the authenticated coach as canceled."
    cancelSession(id: ID!): Boolean!
    "Cancels one candidate's booking on a session owned by the authenticated coach."
    cancelBooking(id: ID!): Boolean!
  }
`
