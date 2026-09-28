import { graphql } from '@/gql'

export const CREATE_SESSION_MUTATION = graphql(`
  mutation CreateSession($input: CreateSessionInput!) {
    createSession(input: $input) {
      id
      title
      type
      status
      startTime
      endTime
      attendeesCount
    }
  }
`)

export const UPDATE_SESSION_MUTATION = graphql(`
  mutation UpdateSession($id: ID!, $input: UpdateSessionInput!) {
    updateSession(id: $id, input: $input) {
      id
      title
      type
      status
      startTime
      endTime
      attendeesCount
    }
  }
`)

export const CANCEL_SESSION_MUTATION = graphql(`
  mutation CancelSession($id: ID!) {
    cancelSession(id: $id)
  }
`)

export const CANCEL_BOOKING_MUTATION = graphql(`
  mutation CancelBooking($id: ID!) {
    cancelBooking(id: $id)
  }
`)
