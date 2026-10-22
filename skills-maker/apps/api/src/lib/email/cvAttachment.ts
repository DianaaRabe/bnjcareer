// ─────────────────────────────────────────────────────────────────────────────
// CV attachment guardrail.
//
// Ports the Python prototype's `verifier_cv`: an application must never go out with a
// truncated, empty or non-PDF "CV". The checks are cheap and deterministic, and they run
// before any provider call so a bad file fails the preparation, not the recipient's inbox.
// ─────────────────────────────────────────────────────────────────────────────

import { MAX_CV_BYTES, MIN_CV_BYTES } from './constants.js'
import { EmailSendError, type EmailAttachment } from './types.js'

const PDF_MAGIC = Buffer.from('%PDF-')

export interface CvVerification {
  ok: boolean
  /** Redacted reason, safe to log — never the file contents. */
  reason?: string
  sizeBytes: number
}

/** Verifies a buffer is a real, non-trivial PDF. Pure — no I/O, no throw. */
export function verifyCvPdf(content: Buffer): CvVerification {
  const sizeBytes = content.length
  if (sizeBytes < PDF_MAGIC.length || !content.subarray(0, PDF_MAGIC.length).equals(PDF_MAGIC)) {
    return { ok: false, reason: 'not_a_pdf', sizeBytes }
  }
  if (sizeBytes < MIN_CV_BYTES) {
    return { ok: false, reason: 'too_small', sizeBytes }
  }
  if (sizeBytes > MAX_CV_BYTES) {
    return { ok: false, reason: 'too_large', sizeBytes }
  }
  return { ok: true, sizeBytes }
}

/**
 * Builds the single PDF attachment for an application, throwing if the file fails the
 * guardrail. Exactly one attachment is produced, mirroring the prototype's invariant.
 */
export function buildCvAttachment(content: Buffer, filename = 'cv.pdf'): EmailAttachment {
  const verdict = verifyCvPdf(content)
  if (!verdict.ok) {
    throw new EmailSendError(`CV attachment rejected (${verdict.reason})`, 'ATTACHMENT_REJECTED', false)
  }
  const safeName = filename.trim().toLowerCase().endsWith('.pdf') ? filename.trim() : 'cv.pdf'
  return { filename: safeName, content, contentType: 'application/pdf' }
}
