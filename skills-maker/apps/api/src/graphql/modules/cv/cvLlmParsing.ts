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

export interface CvOptimizationResult {
  optimizedHtml: string
  improvements: CvImprovement[]
}

/** Parses the optimization LLM response, salvaging the HTML via regex if strict JSON parsing fails. */
export function parseOptimizationResult(raw: string): CvOptimizationResult {
  try {
    const parsed = parseLLMJson<any>(raw)
    return {
      optimizedHtml: parsed.optimized_html || '',
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    }
  } catch {
    // Fall through to schema-specific salvage below.
  }

  let html = ''
  const divMatch = raw.match(/<div[\s\S]*<\/div>/i)
  if (divMatch) {
    html = divMatch[0]
  } else {
    const htmlFieldMatch = raw.match(/"optimized_html"\s*:\s*"([\s\S]*?)"\s*,\s*"improvements"/)
    if (htmlFieldMatch) {
      html = htmlFieldMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\')
    }
  }

  let improvements: CvImprovement[] = []
  const improvementsMatch = raw.match(/"improvements"\s*:\s*(\[[\s\S]*?\])/)
  if (improvementsMatch) {
    try {
      improvements = JSON.parse(improvementsMatch[1])
    } catch {
      improvements = []
    }
  }

  if (!html) {
    throw new Error('Could not extract HTML from LLM response')
  }

  return { optimizedHtml: html, improvements }
}
