import { graphql } from '@/gql'

export const SIGN_COACH_AGREEMENT_MUTATION = graphql(`
  mutation SignCoachAgreement($input: SignCoachAgreementInput!) {
    signCoachAgreement(input: $input) {
      id
      signedName
      contractVersion
      acceptedAt
    }
  }
`)
