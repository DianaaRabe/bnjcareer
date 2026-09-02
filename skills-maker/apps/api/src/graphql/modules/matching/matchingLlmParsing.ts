import { parseLLMJson } from '@/lib/llmClient.js'

export interface JobMatchResult {
  score: number
  summary: string
  strengths: string[]
  gaps: string[]
  tips: string[]
}

/** Keeps a list readable in the UI — the prompt asks for less, this enforces it. */
const MAX_ITEMS = 4

/** Models repeat themselves; a duplicated bullet is noise, and a duplicated React key. */
function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  for (const item of value) {
    if (typeof item !== 'string') continue
    const trimmed = item.trim()
    if (trimmed && !seen.has(trimmed)) seen.add(trimmed)
    if (seen.size === MAX_ITEMS) break
  }
  return [...seen]
}

/** A model can answer 8.5, "82%" or 120 — everything lands on an integer within 0-100. */
function toScore(value: unknown): number | null {
  const raw = typeof value === 'string' ? Number.parseFloat(value.replace('%', '')) : value
  if (typeof raw !== 'number' || Number.isNaN(raw)) return null
  return Math.min(100, Math.max(0, Math.round(raw)))
}

/**
 * Throws when the payload carries nothing usable: a silent fallback would render as a
 * legitimate "0% — weak match" verdict, which reads to the candidate as a real score.
 */
export function parseJobMatchResult(raw: string): JobMatchResult {
  const parsed = parseLLMJson<Partial<Record<keyof JobMatchResult, unknown>>>(raw)

  const score = toScore(parsed.score)
  const result: JobMatchResult = {
    score: score ?? 0,
    summary: typeof parsed.summary === 'string' ? parsed.summary.trim() : '',
    strengths: toStringList(parsed.strengths),
    gaps: toStringList(parsed.gaps),
    tips: toStringList(parsed.tips),
  }

  const hasContent =
    result.summary !== '' ||
    result.strengths.length > 0 ||
    result.gaps.length > 0 ||
    result.tips.length > 0
  if (score === null && !hasContent) {
    throw new Error('LLM response carries neither a score nor any analysis')
  }

  return result
}
