import fs from 'node:fs/promises'
import { env } from '@/config/env.js'
import { publicUrlToFilePath } from '@/lib/uploadStorage.js'

// ─────────────────────────────────────────────────────────────────────────────
// Candidate-CV storage on Supabase Storage (hosted), so every API instance and the
// automation worker read the same bytes — no local disk, per the hosted-infra goal.
//
// A stored CV is referenced by `pdfUrl` using the scheme `supabase://<bucket>/<path>`.
// `readCvBytes` stays backward-compatible: a legacy `/uploads/...` URL still reads from
// local disk, so CVs uploaded before this migration keep working.
//
// Deliberately dependency-free: the Supabase Storage REST API is plain HTTP, reachable
// with the global `fetch`, so no SDK (and no install step) is needed.
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_SCHEME = 'supabase://'

export function isSupabaseRef(ref: string): boolean {
  return ref.startsWith(SUPABASE_SCHEME)
}

/** Builds the stored `pdfUrl` reference for an object placed in the CV bucket. */
export function buildCvStorageRef(objectPath: string): string {
  return `${SUPABASE_SCHEME}${env.SUPABASE_CV_BUCKET}/${objectPath}`
}

function parseRef(ref: string): { bucket: string; path: string } {
  const without = ref.slice(SUPABASE_SCHEME.length)
  const slash = without.indexOf('/')
  if (slash < 0) throw new Error(`Malformed Supabase storage reference: ${ref}`)
  return { bucket: without.slice(0, slash), path: without.slice(slash + 1) }
}

function requireConfig(): { url: string; key: string } {
  const url = env.SUPABASE_URL.trim().replace(/\/+$/, '')
  const key = env.SUPABASE_SERVICE_ROLE_KEY.trim()
  if (!url || !key) {
    throw new Error('Supabase Storage is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)')
  }
  return { url, key }
}

function objectEndpoint(bucket: string, path: string): string {
  const { url } = requireConfig()
  return `${url}/storage/v1/object/${bucket}/${path.split('/').map(encodeURIComponent).join('/')}`
}

/**
 * Uploads CV bytes to the hosted bucket and returns the `supabase://` reference to store
 * as `Cv.pdfUrl`. Upserts, so a re-upload to the same path overwrites cleanly.
 */
export async function uploadCvToStorage(
  objectPath: string,
  bytes: Buffer,
  contentType = 'application/pdf',
): Promise<string> {
  const { key } = requireConfig()
  const res = await fetch(objectEndpoint(env.SUPABASE_CV_BUCKET, objectPath), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: new Uint8Array(bytes),
  })
  if (!res.ok) {
    throw new Error(`Supabase CV upload failed (HTTP ${res.status}): ${await res.text().catch(() => '')}`)
  }
  return buildCvStorageRef(objectPath)
}

/** Downloads the bytes behind a `supabase://` reference. */
export async function downloadCvFromStorage(ref: string): Promise<Buffer> {
  const { key } = requireConfig()
  const { bucket, path } = parseRef(ref)
  const res = await fetch(objectEndpoint(bucket, path), {
    headers: { Authorization: `Bearer ${key}` },
  })
  if (!res.ok) {
    throw new Error(`Supabase CV download failed (HTTP ${res.status})`)
  }
  return Buffer.from(await res.arrayBuffer())
}

/**
 * Reads CV bytes from wherever the stored URL points: a hosted `supabase://` object, or a
 * legacy local `/uploads/...` path. The single read seam used by both the extractor and the
 * application sender.
 */
export async function readCvBytes(pdfUrl: string): Promise<Buffer> {
  if (isSupabaseRef(pdfUrl)) return downloadCvFromStorage(pdfUrl)
  return fs.readFile(publicUrlToFilePath(pdfUrl))
}
