// ─────────────────────────────────────────────────────────────────────────────
// Contact resolution chain.
//
// Order follows skill §8: use what the vacancy already carries, then the company's
// own published pages, and only then a paid people-data provider. Every provider is
// independent — one failing must not stop the others, and the failure is reported
// rather than swallowed (skill §26).
//
// The important output is not "an address" but a *classified* address. A verified
// mailbox can be written to; a pattern guess cannot, and must route the application
// to human review instead of being sent blind.
// ─────────────────────────────────────────────────────────────────────────────

import { findEmailInText, isApplicationEmail } from './emailAddresses.js'
import { lushaEnricher } from './lushaEnricher.js'
import { siteEnricher } from './siteEnricher.js'
import {
  CONTACT_CONFIDENCE,
  CONTACT_SOURCE,
  type ContactCandidate,
  type ContactEnricher,
  type ContactQuery,
  type ContactSource,
} from './types.js'

/** Cheapest and least invasive first. */
export const DEFAULT_ENRICHERS: ContactEnricher[] = [siteEnricher, lushaEnricher]

export interface ContactFailure {
  source: ContactSource
  /** Error name or message — never candidate data. */
  detail: string
}

export interface ContactResolution {
  /** Confirmed at their source and safe to send to. */
  verified: ContactCandidate[]
  /** Pattern guesses. Never send without review (skill §8). */
  guessed: ContactCandidate[]
  /** Providers that errored. Present so a run can report `PARTIAL` rather than `FAILED`. */
  failures: ContactFailure[]
  /** Best verified contact, or null when only guesses (or nothing) were found. */
  best: ContactCandidate | null
}

/** An address the offer text itself carries — some boards embed one in the body. */
function findContactInOffer(query: ContactQuery): ContactCandidate[] {
  if (!query.description) return []
  const email = findEmailInText(query.description)
  if (!email || !isApplicationEmail(email)) return []
  return [
    {
      email,
      contactName: null,
      source: CONTACT_SOURCE.offer,
      confidence: CONTACT_CONFIDENCE.verified,
    },
  ]
}

function describeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`.slice(0, 200)
  return String(error).slice(0, 200)
}

/**
 * Resolves an application contact for one vacancy.
 *
 * `enrichers` is injectable so tests can drive the chain without network access.
 */
export async function resolveJobContact(
  query: ContactQuery,
  enrichers: ContactEnricher[] = DEFAULT_ENRICHERS,
): Promise<ContactResolution> {
  const verified: ContactCandidate[] = []
  const guessed: ContactCandidate[] = []
  const failures: ContactFailure[] = []

  const offerMatches = findContactInOffer(query)
  verified.push(...offerMatches)

  // Only reach for the network while nothing usable has been found.
  if (verified.length === 0) {
    for (const enricher of enrichers) {
      if (!enricher.isConfigured()) continue

      try {
        const found = await enricher.findContacts(query)
        for (const candidate of found) {
          if (candidate.confidence === CONTACT_CONFIDENCE.guessed) guessed.push(candidate)
          else verified.push(candidate)
        }
      } catch (error) {
        // Partial failure: record it and let the next provider try.
        failures.push({ source: enricher.id, detail: describeError(error) })
      }

      if (verified.length > 0) break
    }
  }

  return { verified, guessed, failures, best: verified[0] ?? null }
}

/** Convenience for callers that only need the sendable address. */
export async function resolveContactEmail(query: ContactQuery): Promise<string | null> {
  const resolution = await resolveJobContact(query)
  return resolution.best?.email ?? null
}
