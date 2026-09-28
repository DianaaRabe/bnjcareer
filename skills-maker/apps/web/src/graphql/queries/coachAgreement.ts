import { graphql } from '@/gql'

export const MY_COACH_AGREEMENT_QUERY = graphql(`
  query MyCoachAgreement {
    myCoachAgreement {
      isSigned
      terms {
        currentVersion
        subscriptionShareCoachPct
        formationSharePlatformPct
      }
      signature {
        id
        signedName
        acceptedAt
      }
    }
  }
`)
