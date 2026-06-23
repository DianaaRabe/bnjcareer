// ─────────────────────────────────────────────────────────────────────────────
// CV Immutable Data Extractors
//
// Used by /api/cv-optimize and /api/cv-optimize-job to extract the "sacred"
// fields from cvData that the LLM must NEVER modify or invent.
//
// Why: LLMs (especially free-tier ones) tend to hallucinate contact info,
// invent past experiences, or fabricate education when given freedom. By
// explicitly extracting and labeling these fields in the prompt, we force
// the model to verbatim-copy them and forbid invention.
// ─────────────────────────────────────────────────────────────────────────────

function firstTruthy(...values: any[]): string | null {
  for (const v of values) {
    if (v != null && v !== "" && String(v).trim() !== "") return String(v).trim()
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

export function extractImmutableContact(cvData: any, profile: any): ImmutableContact {
  return {
    name: firstTruthy(
      cvData?.fullName,
      cvData?.name,
      cvData?.personalInfo?.fullName,
      cvData?.personalInfo?.name,
      cvData?.contact?.name,
      cvData?.contact?.fullName,
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" "),
    ),
    email: firstTruthy(
      cvData?.email,
      cvData?.personalInfo?.email,
      cvData?.contact?.email,
    ),
    phone: firstTruthy(
      cvData?.phone,
      cvData?.telephone,
      cvData?.personalInfo?.phone,
      cvData?.contact?.phone,
      cvData?.contact?.telephone,
    ),
    location: firstTruthy(
      cvData?.location,
      cvData?.address,
      cvData?.city,
      cvData?.personalInfo?.location,
      cvData?.personalInfo?.address,
      cvData?.contact?.location,
      cvData?.contact?.address,
    ),
    linkedin: firstTruthy(
      cvData?.linkedin,
      cvData?.linkedinUrl,
      cvData?.personalInfo?.linkedin,
      cvData?.contact?.linkedin,
    ),
  }
}

export function formatImmutableExperiences(cvData: any): string {
  const xps =
    cvData?.experiences ||
    cvData?.experience ||
    cvData?.workExperience ||
    cvData?.work_experience ||
    []
  if (!Array.isArray(xps) || xps.length === 0) {
    return "  (aucune expérience listée dans le CV original)"
  }
  return xps
    .map((x: any, i: number) => {
      const company = firstTruthy(x.company, x.employer, x.organization, x.entreprise) ?? "[Entreprise]"
      const title   = firstTruthy(x.title, x.role, x.position, x.jobTitle, x.intitule, x.poste) ?? "[Intitulé]"
      const start   = firstTruthy(x.startDate, x.start, x.dateDebut) ?? "?"
      const end     = firstTruthy(x.endDate, x.end, x.dateFin) ?? "Présent"
      return `  ${i + 1}. "${title}" chez "${company}" (${start} — ${end})`
    })
    .join("\n")
}

export function formatImmutableEducation(cvData: any): string {
  const eds =
    cvData?.education ||
    cvData?.educations ||
    cvData?.formations ||
    cvData?.formation ||
    []
  if (!Array.isArray(eds) || eds.length === 0) {
    return "  (aucune formation listée dans le CV original)"
  }
  return eds
    .map((e: any, i: number) => {
      const degree = firstTruthy(e.degree, e.title, e.diploma, e.diplome) ?? "[Diplôme]"
      const school = firstTruthy(e.school, e.institution, e.establishment, e.etablissement, e.ecole) ?? "[École]"
      const start  = firstTruthy(e.startDate, e.start, e.dateDebut) ?? "?"
      const end    = firstTruthy(e.endDate, e.end, e.dateFin) ?? "?"
      return `  ${i + 1}. "${degree}" — "${school}" (${start} — ${end})`
    })
    .join("\n")
}
