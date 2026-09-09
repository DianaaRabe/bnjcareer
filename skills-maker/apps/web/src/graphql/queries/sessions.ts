import { graphql } from '@/gql'

export const MY_SESSIONS_QUERY = graphql(`
  query MySessions {
    mySessions {
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

export const MY_SESSION_QUERY = graphql(`
  query MySession($id: ID!) {
    mySession(id: $id) {
      id
      title
      type
      status
      startTime
      endTime
      attendeesCount
      attendees {
        id
        firstName
        lastName
        avatarUrl
        status
      }
    }
  }
`)
