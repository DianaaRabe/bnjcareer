// ─────────────────────────────────────────────────────────────────────────────
// Deterministic matching fallback.
//
// The LLM matcher is the primary scorer, but it is also the single most fragile step
// of the pipeline: free provider tiers rate-limit, and a degraded answer carries no
// usable score. When that happens the run must still produce something the candidate
// can review (skill §26, continuity) rather than silently preparing nothing.
//
// This scorer is a keyword-overlap heuristic: how much of the candidate's own
// vocabulary (CV + profile) reappears in the offer. It is intentionally simple and
// pure — no network, no model — so it always returns a number and is trivially
// testable. A job scored this way is flagged for review by the engine: the overlap is
// a signal, not a verdict, and a human confirms before anything is ever sent.
// ─────────────────────────────────────────────────────────────────────────────

import type { Profile } from '@prisma/client'
import { normalizeText } from '@/lib/jobs/canonical.js'
import type { CanonicalJob } from './types.js'

/** A token shorter than this carries no matching signal (de, it, ok…). */
const MIN_TOKEN_LENGTH = 3

/**
 * Words common to almost every CV *and* every job posting, in both languages. They would
 * otherwise inflate every overlap uniformly and flatten the score, so they are dropped on
 * both sides. This is a filler list, not an exhaustive stopword dictionary — recruitment
 * boilerplate ("poste", "mission", "equipe") matters more here than grammatical glue.
 */
const STOPWORDS = new Set(
  [
    // FR grammar / filler
    'les', 'des', 'une', 'aux', 'pour', 'avec', 'dans', 'sur', 'par', 'est', 'sont', 'ses',
    'nos', 'vos', 'leur', 'leurs', 'cette', 'ces', 'qui', 'que', 'quoi', 'dont', 'plus',
    'tres', 'tout', 'tous', 'toute', 'toutes', 'votre', 'notre', 'vous', 'nous', 'etre',
    // FR recruitment boilerplate
    'poste', 'mission', 'missions', 'equipe', 'entreprise', 'societe', 'profil', 'candidat',
    'candidate', 'candidature', 'offre', 'emploi', 'travail', 'recherche', 'recherchons',
    'experience', 'experiences', 'competences', 'competence', 'cadre', 'contrat', 'rejoindre',
    'groupe', 'service', 'services', 'client', 'clients', 'annee', 'annees', 'mois', 'jour',
    // EN grammar / filler
    'the', 'and', 'for', 'with', 'you', 'your', 'our', 'are', 'from', 'this', 'that', 'will',
    'have', 'has', 'their', 'they', 'who', 'what', 'all', 'more', 'job', 'role', 'team',
    'company', 'experience', 'skills', 'work', 'working', 'position', 'candidate', 'join',
  ].map((w) => normalizeText(w)),
)

/** Splits arbitrary text into the set of meaningful, normalised tokens it contains. */
function tokenize(text: string): Set<string> {
  const tokens = new Set<string>()
  for (const token of normalizeText(text).split(/[^a-z0-9]+/)) {
    if (token.length >= MIN_TOKEN_LENGTH && !STOPWORDS.has(token)) tokens.add(token)
  }
  return tokens
}

/**
 * Flattens everything the candidate has told us about themselves into one blob of text. The CV
 * extraction shape varies, so it is stringified wholesale rather than walked field by field —
 * the tokenizer does not care about structure, only words.
 */
function candidateText(extractedData: unknown, profile: Profile | null): string {
  const parts: string[] = []
  if (extractedData != null) {
    parts.push(typeof extractedData === 'string' ? extractedData : safeStringify(extractedData))
  }
  if (profile) parts.push(safeStringify(profile))
  return parts.join(' ')
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value) ?? ''
  } catch {
    return ''
  }
}

/**
 * A 0-100 affinity score from the overlap between the candidate's vocabulary and the offer's.
 *
 * The mapping saturates: a handful of shared *meaningful* tokens already signals a real match,
 * and piling on more should not keep pushing the score linearly toward 100. `overlap / (overlap
 * + K)` gives exactly that curve — 0 shared → 0, and it rises fast then flattens:
 *   overlap  1   2   4   6   8  12  20
 *   score   25  40  57  67  73  80  87     (K = 3)
 * K is tuned so that roughly six shared meaningful tokens clear the default minMatchScore (65).
 * Returns 0 when either side has no usable tokens (no CV, or an empty offer) — the engine then
 * treats it as a low match and skips it, never as a false positive.
 */
export function heuristicMatchScore(
  extractedData: unknown,
  profile: Profile | null,
  job: CanonicalJob,
): number {
  const candidate = tokenize(candidateText(extractedData, profile))
  if (candidate.size === 0) return 0

  const offer = tokenize([job.title, job.company ?? '', job.location, ...job.tags, job.description].join(' '))
  if (offer.size === 0) return 0

  let overlap = 0
  for (const token of offer) {
    if (candidate.has(token)) overlap += 1
  }

  const K = 3
  return Math.round((overlap / (overlap + K)) * 100)
}
