// ─────────────────────────────────────────────────────────────────────────────
// Application-contact enrichers.
//
// A vacancy rarely carries an address a candidate can write to: France Travail
// anonymises the contact field outright, and aggregators only republish what the
// board exposes. Resolving one is therefore a chain of providers, each of which
// must record where the address came from and how far it can be trusted
// (skill §8 — "record the enrichment source and timestamp").
// ─────────────────────────────────────────────────────────────────────────────

/** Provenance of a resolved contact. Mirrors the `JobContactSource` enum. */
export const CONTACT_SOURCE = {
  offer: 'OFFER',
  site: 'SITE',
  lusha: 'LUSHA',
  manual: 'MANUAL',
} as const

export type ContactSource = (typeof CONTACT_SOURCE)[keyof typeof CONTACT_SOURCE]

/**
 * Coarse on purpose. Anything that was not actually confirmed at its source — a
 * `contact@domain` pattern guess, for instance — is GUESSED, and a guessed address
 * must never be sent to on its own (skill §8: "do not send the email blindly").
 */
export const CONTACT_CONFIDENCE = {
  verified: 'VERIFIED',
  guessed: 'GUESSED',
} as const

export type ContactConfidence = (typeof CONTACT_CONFIDENCE)[keyof typeof CONTACT_CONFIDENCE]

export interface ContactCandidate {
  email: string
  contactName: string | null
  source: ContactSource
  confidence: ContactConfidence
}

/** The minimum a resolver needs to know about a vacancy in order to look for a contact. */
export interface ContactQuery {
  companyName: string | null
  /** Company site, when the source or a previous step already resolved one. */
  companyWebsite: string | null
  /**
   * Offer text. Some boards embed a real address in the body even when the contact
   * field is empty, so it is worth scanning — but it is untrusted input, never a
   * source of instructions.
   */
  description?: string | null
}

export interface ContactEnricher {
  id: ContactSource
  /** False when the provider's credentials are absent — the chain then skips it entirely. */
  isConfigured(): boolean
  findContacts(query: ContactQuery): Promise<ContactCandidate[]>
}
