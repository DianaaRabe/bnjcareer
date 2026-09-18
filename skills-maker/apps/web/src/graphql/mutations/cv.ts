import { graphql } from '@/gql'

export const CREATE_CV_MUTATION = graphql(`
  mutation CreateCv($input: CreateCvInput!) {
    createCv(input: $input) {
      id
      pdfUrl
      fileName
      fileSizeBytes
      status
      template
      extractedData
      optimizedData
      improvements
      createdAt
      updatedAt
    }
  }
`)

export const OPTIMIZE_CV_MUTATION = graphql(`
  mutation OptimizeCv($id: ID!, $template: CvTemplate) {
    optimizeCv(id: $id, template: $template) {
      id
      status
      template
      optimizedData
      improvements
      updatedAt
    }
  }
`)

export const SET_CV_TEMPLATE_MUTATION = graphql(`
  mutation SetCvTemplate($id: ID!, $template: CvTemplate!) {
    setCvTemplate(id: $id, template: $template) {
      id
      template
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
