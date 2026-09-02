import gql from 'graphql-tag'

export const cvTypeDefs = gql`
  scalar JSON

  enum CvStatus {
    UPLOADED
    EXTRACTING
    EXTRACTED
    EXTRACTION_FAILED
    OPTIMIZING
    OPTIMIZED
    OPTIMIZATION_FAILED
  }

  type Cv {
    id: ID!
    pdfUrl: String
    fileName: String
    fileSizeBytes: Int
    status: CvStatus!
    "Structured data extracted from the PDF (contact info, experiences, education, skills, summary)."
    extractedData: JSON
    optimizedHtml: String
    "Categorized list of ATS improvements applied by the optimizer."
    improvements: JSON
    createdAt: String!
    updatedAt: String!
  }

  input CreateCvInput {
    pdfUrl: String!
    fileName: String!
    fileSizeBytes: Int!
  }

  input UpdateCvDetailsInput {
    fullName: String
    professionalTitle: String
    summary: String
  }

  type Query {
    "The authenticated candidate's most recent CV, if any."
    myCv: Cv
  }

  type Mutation {
    "Registers an uploaded PDF and synchronously extracts its content via the LLM."
    createCv(input: CreateCvInput!): Cv!
    "Runs the ATS optimization prompt against an already-extracted CV."
    optimizeCv(id: ID!): Cv!
    "Patches user-edited fields (name/title/summary) into the extracted data."
    updateCvDetails(id: ID!, input: UpdateCvDetailsInput!): Cv!
  }
`
