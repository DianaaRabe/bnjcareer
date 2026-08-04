import { graphql } from '@/gql'

export const CREATE_CV_MUTATION = graphql(`
  mutation CreateCv($input: CreateCvInput!) {
    createCv(input: $input) {
      id
      pdfUrl
      fileName
      fileSizeBytes
      status
      extractedData
      optimizedHtml
      improvements
      createdAt
      updatedAt
    }
  }
`)

export const OPTIMIZE_CV_MUTATION = graphql(`
  mutation OptimizeCv($id: ID!) {
    optimizeCv(id: $id) {
      id
      status
      optimizedHtml
      improvements
      updatedAt
    }
  }
`)

export const UPDATE_CV_DETAILS_MUTATION = graphql(`
  mutation UpdateCvDetails($id: ID!, $input: UpdateCvDetailsInput!) {
    updateCvDetails(id: $id, input: $input) {
      id
      extractedData
    }
  }
`)
