import path from 'node:path'
import { env } from '@/config/env.js'

// Shared between the REST upload route (writes) and cvService (reads) so both
// sides agree on where files live on disk vs. the public URL that references them.

export const CV_MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB — mirrors the web upload zone's limit
export const CV_UPLOAD_SUBDIR = 'cv'
export const UPLOADS_PUBLIC_PATH = '/uploads'

export function getCvUploadDir(): string {
  return path.join(env.UPLOAD_DIR, CV_UPLOAD_SUBDIR)
}

export function buildCvPublicUrl(fileName: string): string {
  return `${UPLOADS_PUBLIC_PATH}/${CV_UPLOAD_SUBDIR}/${fileName}`
}

/** Resolves a public `/uploads/...` URL back to its absolute path on disk. */
export function publicUrlToFilePath(publicUrl: string): string {
  const relative = publicUrl.startsWith(UPLOADS_PUBLIC_PATH)
    ? publicUrl.slice(UPLOADS_PUBLIC_PATH.length + 1)
    : publicUrl
  return path.join(env.UPLOAD_DIR, relative)
}
