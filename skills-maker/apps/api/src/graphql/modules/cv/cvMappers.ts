import type { Cv } from '@prisma/client'
import { CvTemplate } from '@gql/resolvers-types.js'

export function toGraphQLCv(cv: Cv) {
  return {
    id: cv.id,
    pdfUrl: cv.pdfUrl,
    fileName: cv.fileName,
    fileSizeBytes: cv.fileSizeBytes,
    status: cv.status,
    template: (cv.template as CvTemplate | null) ?? null,
    extractedData: cv.extractedData,
    optimizedData: cv.optimizedData,
    improvements: cv.improvements,
    createdAt: cv.createdAt.toISOString(),
    updatedAt: cv.updatedAt.toISOString(),
  }
}
