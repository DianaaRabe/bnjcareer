import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildCvAttachment, verifyCvPdf } from '../cvAttachment.js'
import { MIN_CV_BYTES } from '../constants.js'
import { EmailSendError } from '../types.js'

/** A buffer that starts with the PDF magic and reaches `size` bytes. */
function pdfOf(size: number): Buffer {
  const header = Buffer.from('%PDF-1.7\n')
  const padding = Buffer.alloc(Math.max(0, size - header.length), 0x20)
  return Buffer.concat([header, padding])
}

describe('verifyCvPdf', () => {
  it('accepts a real, large-enough PDF', () => {
    const verdict = verifyCvPdf(pdfOf(MIN_CV_BYTES + 100))
    assert.equal(verdict.ok, true)
    assert.equal(verdict.sizeBytes, MIN_CV_BYTES + 100)
  })

  it('rejects a non-PDF buffer', () => {
    const verdict = verifyCvPdf(Buffer.from('not a pdf, just text that is long'.repeat(2000)))
    assert.equal(verdict.ok, false)
    assert.equal(verdict.reason, 'not_a_pdf')
  })

  it('rejects a PDF that is suspiciously small', () => {
    const verdict = verifyCvPdf(pdfOf(500))
    assert.equal(verdict.ok, false)
    assert.equal(verdict.reason, 'too_small')
  })

  it('rejects an empty buffer', () => {
    const verdict = verifyCvPdf(Buffer.alloc(0))
    assert.equal(verdict.ok, false)
    assert.equal(verdict.reason, 'not_a_pdf')
  })
})

describe('buildCvAttachment', () => {
  it('builds a single application/pdf attachment for a valid CV', () => {
    const attachment = buildCvAttachment(pdfOf(MIN_CV_BYTES + 1), 'Mon CV.pdf')
    assert.equal(attachment.contentType, 'application/pdf')
    assert.equal(attachment.filename, 'Mon CV.pdf')
  })

  it('normalises a filename without a .pdf extension', () => {
    const attachment = buildCvAttachment(pdfOf(MIN_CV_BYTES + 1), 'resume')
    assert.equal(attachment.filename, 'cv.pdf')
  })

  it('throws ATTACHMENT_REJECTED for an invalid CV', () => {
    assert.throws(
      () => buildCvAttachment(pdfOf(100)),
      (err: unknown) => err instanceof EmailSendError && err.code === 'ATTACHMENT_REJECTED',
    )
  })
})
