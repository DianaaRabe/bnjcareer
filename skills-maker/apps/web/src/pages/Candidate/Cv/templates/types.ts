import type { CvExtractedData } from '../useCv'

/** Layout-agnostic data a template renders. Contact fields are always immutable (from extraction). */
export interface CvRenderExperience {
  title: string | null
  company: string | null
  location: string | null
  startDate: string | null
  endDate: string | null
  bullets: string[]
}

export interface CvRenderEducation {
  degree: string | null
  school: string | null
  startDate: string | null
  endDate: string | null
}

export interface CvRenderLanguage {
  name: string | null
  level: string | null
}

export interface CvRenderData {
  fullName: string | null
  professionalTitle: string | null
  email: string | null
  phone: string | null
  location: string | null
  linkedin: string | null
  summary: string | null
  experiences: CvRenderExperience[]
  education: CvRenderEducation[]
  skills: string[]
  languages: CvRenderLanguage[]
  interests: string[]
}

/** Structured optimized content returned by the optimizer (mirrors the API's CvOptimizedData). */
export interface CvOptimizedData {
  professionalTitle?: string | null
  summary?: string | null
  experiences?: Partial<CvRenderExperience>[]
  education?: CvRenderEducation[]
  skills?: string[]
  languages?: CvRenderLanguage[]
  interests?: string[]
}

function splitToBullets(description: string | null | undefined): string[] {
  if (!description) return []
  return description
    .split(/\n|•|;/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * Merges immutable contact info (always from extraction) with optimized content when available,
 * falling back to raw extracted content otherwise. This is what every template consumes.
 */
export function buildRenderData(
  extracted: CvExtractedData | null,
  optimized: CvOptimizedData | null,
): CvRenderData {
  const experiences: CvRenderExperience[] = optimized?.experiences?.length
    ? optimized.experiences.map((x) => ({
        title: x.title ?? null,
        company: x.company ?? null,
        location: x.location ?? null,
        startDate: x.startDate ?? null,
        endDate: x.endDate ?? null,
        bullets: x.bullets ?? [],
      }))
    : (extracted?.experiences ?? []).map((x) => ({
        title: x.title,
        company: x.company,
        location: null,
        startDate: x.startDate,
        endDate: x.endDate,
        bullets: splitToBullets(x.description),
      }))

  const education: CvRenderEducation[] = optimized?.education?.length
    ? optimized.education
    : (extracted?.education ?? []).map((e) => ({
        degree: e.degree,
        school: e.school,
        startDate: e.startDate,
        endDate: e.endDate,
      }))

  return {
    // Contact — always immutable, taken from extraction.
    fullName: extracted?.fullName ?? null,
    email: extracted?.email ?? null,
    phone: extracted?.phone ?? null,
    location: extracted?.location ?? null,
    linkedin: extracted?.linkedin ?? null,
    // Content — optimized if present, else raw extracted.
    professionalTitle: optimized?.professionalTitle ?? extracted?.professionalTitle ?? null,
    summary: optimized?.summary ?? extracted?.summary ?? null,
    experiences,
    education,
    skills: optimized?.skills?.length ? optimized.skills : (extracted?.skills ?? []),
    languages: optimized?.languages ?? [],
    interests: optimized?.interests ?? [],
  }
}

/** Initials (e.g. "Jean Dupont" → "JD"); falls back to "CV". */
export function initialsOf(fullName: string | null): string {
  if (!fullName) return 'CV'
  const parts = fullName.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase() || 'CV'
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (start && end) return `${start} — ${end}`
  return start || end || ''
}

export function contactLine(data: CvRenderData): string {
  return [data.email, data.phone, data.location, data.linkedin].filter(Boolean).join(' · ')
}
