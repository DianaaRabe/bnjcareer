// ─────────────────────────────────────────────────────────────────────────────
// Application-email composer.
//
// Turns a prepared application (cover letter + candidate identity + CV) into the
// `OutgoingEmail` the sender ships. Pure and synchronous so the exact rendered
// subject/body/reply-to are unit-testable without a database or a provider.
//
// What it does NOT decide (server-side, out of a caller's reach — see sender.ts /
// buildMessage.ts): the `from` address and the mandatory audit BCC. This composer
// only fills the candidate-facing fields. The candidate is the Reply-To, never a
// visible recipient and never the BCC (approved email model, 2026-10).
// ─────────────────────────────────────────────────────────────────────────────

import { buildCvAttachment } from './cvAttachment.js'
import type { OutgoingEmail } from './types.js'

export interface ApplicationEmailInput {
  /** The verified recipient address (the company mailbox). Resolved upstream, never guessed here. */
  recipientEmail: string
  /** The vacancy title, used in the subject line. */
  jobTitle: string
  /** Candidate display name, e.g. "Marie Dupont". Empty/blank omits the "· Nom" suffix. */
  candidateName: string
  /** Candidate's own address — becomes the Reply-To so a recruiter's answer reaches them. */
  candidateEmail: string
  /** Optional phone, appended to the signature when present. */
  candidatePhone?: string | null
  /** The generated cover letter body (already fact-checked against the CV). */
  coverLetter: string
  /** The CV PDF bytes to attach. Verified by {@link buildCvAttachment}. */
  cvContent: Buffer
  /** File name shown to the recipient; coerced to end in `.pdf`. */
  cvFilename?: string
}

/** `Candidature — {poste} · {Nom}`, dropping the name suffix when it is blank. */
export function buildSubject(jobTitle: string, candidateName: string): string {
  const title = jobTitle.trim() || 'candidature'
  const name = candidateName.trim()
  return name ? `Candidature — ${title} · ${name}` : `Candidature — ${title}`
}

/**
 * Greeting + letter + signature. No BNJ branding (approved model): the message reads as
 * the candidate's own. The signature carries the candidate's name and contact so a reply
 * can also reach them directly, not only through Reply-To.
 */
export function buildBody(input: ApplicationEmailInput): string {
  const name = input.candidateName.trim()
  const phone = input.candidatePhone?.trim()
  const contactLine = [input.candidateEmail.trim(), phone].filter(Boolean).join(' · ')

  const signature = ['Cordialement,', name, contactLine].filter(Boolean).join('\n')

  return `Bonjour,\n\n${input.coverLetter.trim()}\n\n${signature}\n\n— Vous trouverez mon CV en pièce jointe.`
}

/**
 * Composes the candidate-facing email. Throws (via {@link buildCvAttachment}) when the CV
 * is not a plausible PDF, so a bad attachment fails here rather than in a recruiter's inbox.
 */
export function buildApplicationEmail(input: ApplicationEmailInput): OutgoingEmail {
  return {
    to: input.recipientEmail.trim(),
    subject: buildSubject(input.jobTitle, input.candidateName),
    text: buildBody(input),
    replyTo: input.candidateEmail.trim(),
    attachments: [buildCvAttachment(input.cvContent, input.cvFilename)],
  }
}
