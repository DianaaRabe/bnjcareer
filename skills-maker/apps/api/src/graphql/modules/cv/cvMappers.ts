import type { Cv } from '@prisma/client'

export function toGraphQLCv(cv: Cv) {
  return {
    id: cv.id,
    pdfUrl: cv.pdfUrl,
    fileName: cv.fileName,
    fileSizeBytes: cv.fileSizeBytes,
    status: cv.status,
    extractedData: cv.extractedData,
    optimizedHtml: cv.optimizedHtml,
    improvements: cv.improvements,
    createdAt: cv.createdAt.toISOString(),
    updatedAt: cv.updatedAt.toISOString(),
  }
}
