// ─────────────────────────────────────────────────────────────────────────────
// Extracts the "sacred" fields from a CV's extracted data that the optimization
// LLM must never invent or modify — contact info, past experiences, education.
// Ported from the legacy anti-hallucination extractors (lib/cv/immutable.ts).
// ─────────────────────────────────────────────────────────────────────────────

import type { Profile } from '@prisma/client'

function firstTruthy(...values: unknown[]): string | null {
  for (const v of values) {
    if (v != null && String(v).trim() !== '') return String(v).trim()
  }
  return null
}

export interface ImmutableContact {
  name: string | null
  email: string | null
  phone: string | null
  location: string | null
  linkedin: string | null
}

export function extractImmutableContact(extractedData: any, profile: Profile | null): ImmutableContact {
  return {
    name: firstTruthy(
      extractedData?.fullName,
      [profile?.firstName, profile?.lastName].filter(Boolean).join(' '),
    ),
    email: firstTruthy(extractedData?.email),
    phone: firstTruthy(extractedData?.phone, profile?.phone),
    location: firstTruthy(extractedData?.location),
    linkedin: firstTruthy(extractedData?.linkedin),
  }
}

export function formatImmutableExperiences(extractedData: any): string {
  const experiences = extractedData?.experiences
  if (!Array.isArray(experiences) || experiences.length === 0) {
    return '  (aucune expérience listée dans le CV original)'
  }
  return experiences
    .map((x: any, i: number) => {
      const company = firstTruthy(x?.company) ?? '[Entreprise]'
      const title = firstTruthy(x?.title) ?? '[Intitulé]'
      const start = firstTruthy(x?.startDate) ?? '?'
      const end = firstTruthy(x?.endDate) ?? 'Présent'
      return `  ${i + 1}. "${title}" chez "${company}" (${start} — ${end})`
    })
    .join('\n')
}

export function formatImmutableEducation(extractedData: any): string {
  const education = extractedData?.education
  if (!Array.isArray(education) || education.length === 0) {
    return '  (aucune formation listée dans le CV original)'
  }
  return education
    .map((e: any, i: number) => {
      const degree = firstTruthy(e?.degree) ?? '[Diplôme]'
      const school = firstTruthy(e?.school) ?? '[École]'
      const start = firstTruthy(e?.startDate) ?? '?'
      const end = firstTruthy(e?.endDate) ?? '?'
      return `  ${i + 1}. "${degree}" — "${school}" (${start} — ${end})`
    })
    .join('\n')
}
