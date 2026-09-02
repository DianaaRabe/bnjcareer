import { graphql } from '@/gql'

export const MY_CV_QUERY = graphql(`
  query MyCv {
    myCv {
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
