// ─────────────────────────────────────────────────────────────────────────────
// Detects whether a user's "industry" profile field falls into the tech bucket.
//
// Used by /api/jobs/instant to decide which set of placeholder offers to show
// (runs/tech vs runs/non-tech) before the user starts a real search.
// ─────────────────────────────────────────────────────────────────────────────

// Each pattern is anchored to word boundaries where it matters, to avoid
// false positives like "média" matching "ia".
const TECH_PATTERNS: RegExp[] = [
  /\btech(?:no|nologie|nology)?\b/i,
  /d[ée]vel[op]+(?:e|er|eur|euse|ement)/i,  // développe(ment|ur|euse)
  /\bdev(?:ops|rel)?\b/i,
  /\bdata\b/i,
  /\binformati(?:que|cien)/i,
  /\binfo(?:rmatique)?\b/i,
  /\bi\.?a\.?\b/i,                          // IA / I.A.
  /\ba\.?i\.?\b/i,                          // AI / A.I.
  /machine\s*learning/i,
  /\bml(?:\s*engineer)?\b/i,
  /\bengineer\b/i,
  /\bing[ée]nieur/i,
  /\bsoftware\b/i,
  /\blogiciel\b/i,
  /\bweb\b/i,
  /\bmobile\b/i,
  /\bcyber(?:s[ée]cur)?/i,
  /\bcloud\b/i,
  /\bsre\b/i,
  /\bback[\s-]?end\b/i,
  /\bfront[\s-]?end\b/i,
  /\bfull[\s-]?stack\b/i,
  /\b(?:react|node|python|java|kotlin|swift|kubernetes|docker)\b/i,
]

/** Returns true if the industry string matches any tech-related keyword. */
export function isTechIndustry(industry: string | null | undefined): boolean {
  if (!industry) return false
  return TECH_PATTERNS.some((rx) => rx.test(industry))
}
