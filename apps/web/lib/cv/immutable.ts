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
      [cvData?.firstName, cvData?.lastName].filter(Boolean).join(" "),
      [cvData?.prenom, cvData?.nom].filter(Boolean).join(" "),
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
      // Dates : le service peut renvoyer une chaîne unique (period/dates) OU start/end séparés.
      const start   = firstTruthy(x.startDate, x.start, x.dateDebut)
      const end     = firstTruthy(x.endDate, x.end, x.dateFin)
      const period  = firstTruthy(x.period, x.dates, x.duree, x.date) ??
        (start ? `${start} — ${end ?? "Présent"}` : "Dates non précisées")

      // Missions d'origine : à fournir au LLM comme base à reformuler (jamais à inventer).
      const missionsRaw =
        x.missions || x.mission || x.tasks || x.responsibilities ||
        x.achievements || x.bullets || x.description
      const missions: string[] = Array.isArray(missionsRaw)
        ? missionsRaw.filter((m: any) => firstTruthy(m))
        : firstTruthy(missionsRaw)
          ? [String(missionsRaw).trim()]
          : []

      const header = `  ${i + 1}. "${title}" chez "${company}" (${period})`
      if (missions.length === 0) return header
      const missionLines = missions.map((m) => `       • ${String(m).trim()}`).join("\n")
      return `${header}\n     Missions d'origine (à reformuler, ne rien inventer) :\n${missionLines}`
    })
    .join("\n")
}

/**
 * Compact summary of the CV fields NOT already covered by the immutable
 * contact / experiences / education sections — i.e. the professional title,
 * summary/description, and the candidate's own skills/tools list.
 *
 * Why: the full `JSON.stringify(cvData)` dump duplicates data already listed in
 * sections A/B/C and can add 1500-2500 tokens, which pushes the request over the
 * provider's per-minute token limit (HTTP 413). This keeps only what's missing.
 */
export function formatCvExtras(cvData: any): string {
  const title = firstTruthy(cvData?.title, cvData?.headline, cvData?.poste)
  const summary = firstTruthy(cvData?.description, cvData?.summary, cvData?.resume, cvData?.profile)
  const toolsRaw = cvData?.tools || cvData?.skills || cvData?.competences || cvData?.outils
  const tools: string[] = Array.isArray(toolsRaw)
    ? toolsRaw.map((t: any) => String(t ?? "").trim()).filter(Boolean)
    : firstTruthy(toolsRaw)
      ? [String(toolsRaw).trim()]
      : []

  const lines: string[] = []
  lines.push(`- Titre / poste (CV) : ${title ?? "(non renseigné)"}`)
  lines.push(`- Résumé / description (CV) : ${summary ?? "(non renseigné)"}`)
  lines.push(
    `- Compétences & outils (CV) : ${tools.length ? tools.join(", ") : "(aucun listé)"}`
  )
  return lines.join("\n")
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
      const start  = firstTruthy(e.startDate, e.start, e.dateDebut)
      const end    = firstTruthy(e.endDate, e.end, e.dateFin)
      const period = firstTruthy(e.year, e.period, e.annee, e.dates, e.date) ??
        (start ? `${start} — ${end ?? "?"}` : "Dates non précisées")
      return `  ${i + 1}. "${degree}" — "${school}" (${period})`
    })
    .join("\n")
}
