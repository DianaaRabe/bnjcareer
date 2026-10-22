import { parseLLMJson } from '@/lib/llmClient.js'

export interface CvExperience {
  title: string | null
  company: string | null
  startDate: string | null
  endDate: string | null
  description: string | null
}

export interface CvEducation {
  degree: string | null
  school: string | null
  startDate: string | null
  endDate: string | null
}

export interface CvExtractedData {
  fullName: string | null
  email: string | null
  phone: string | null
  location: string | null
  linkedin: string | null
  professionalTitle: string | null
  summary: string | null
  experiences: CvExperience[]
  education: CvEducation[]
  skills: string[]
}

/** Parses the extraction LLM response into a well-formed CvExtractedData, tolerating partial/missing fields. */
export function parseExtractionResult(raw: string): CvExtractedData {
  const parsed = parseLLMJson<Partial<CvExtractedData>>(raw)

  return {
    fullName: parsed.fullName ?? null,
    email: parsed.email ?? null,
    phone: parsed.phone ?? null,
    location: parsed.location ?? null,
    linkedin: parsed.linkedin ?? null,
    professionalTitle: parsed.professionalTitle ?? null,
    summary: parsed.summary ?? null,
    experiences: Array.isArray(parsed.experiences) ? parsed.experiences : [],
    education: Array.isArray(parsed.education) ? parsed.education : [],
    skills: Array.isArray(parsed.skills) ? parsed.skills.filter((s): s is string => typeof s === 'string') : [],
  }
}

export interface CvImprovement {
  category: string
  description: string
  impact: 'high' | 'medium' | 'low'
}

export interface CvOptimizedExperience {
  title: string | null
  company: string | null
  location: string | null
  startDate: string | null
  endDate: string | null
  bullets: string[]
}

export interface CvLanguage {
  name: string | null
  level: string | null
}

/** Structured, layout-agnostic optimized CV content. Rendered client-side into the chosen template. */
export interface CvOptimizedData {
  professionalTitle: string | null
  summary: string | null
  experiences: CvOptimizedExperience[]
  education: CvEducation[]
  skills: string[]
  languages: CvLanguage[]
  interests: string[]
}

export interface CvOptimizationResult {
  optimizedData: CvOptimizedData
  improvements: CvImprovement[]
}

function asString(v: unknown): string | null {
  return typeof v === 'string' && v.trim() !== '' ? v : null
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string' && s.trim() !== '') : []
}

function normalizeExperience(x: any): CvOptimizedExperience {
  // Tolerate the LLM returning `description` (string) instead of `bullets` (array).
  let bullets = asStringArray(x?.bullets)
  if (bullets.length === 0 && typeof x?.description === 'string') {
    bullets = x.description
      .split(/\n|•|;/)
      .map((s: string) => s.trim())
      .filter(Boolean)
  }
  return {
    title: asString(x?.title),
    company: asString(x?.company),
    location: asString(x?.location),
    startDate: asString(x?.startDate),
    endDate: asString(x?.endDate),
    bullets,
  }
}

/** Parses the optimization LLM response into structured, layout-agnostic content. */
export function parseOptimizationResult(raw: string): CvOptimizationResult {
  const parsed = parseLLMJson<any>(raw)

  const optimizedData: CvOptimizedData = {
    professionalTitle: asString(parsed?.professionalTitle),
    summary: asString(parsed?.summary),
    experiences: Array.isArray(parsed?.experiences) ? parsed.experiences.map(normalizeExperience) : [],
    education: Array.isArray(parsed?.education)
      ? parsed.education.map((e: any) => ({
          degree: asString(e?.degree),
          school: asString(e?.school),
          startDate: asString(e?.startDate),
          endDate: asString(e?.endDate),
        }))
      : [],
    skills: asStringArray(parsed?.skills),
    languages: Array.isArray(parsed?.languages)
      ? parsed.languages.map((l: any) => ({ name: asString(l?.name), level: asString(l?.level) }))
      : [],
    interests: asStringArray(parsed?.interests),
  }

  const improvements: CvImprovement[] = Array.isArray(parsed?.improvements) ? parsed.improvements : []

  return { optimizedData, improvements }
}
