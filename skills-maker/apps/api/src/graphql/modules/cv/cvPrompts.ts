import type { Profile } from '@prisma/client'
import { extractImmutableContact, formatImmutableEducation, formatImmutableExperiences } from './cvImmutable.js'

/** Structures raw PDF text into JSON — must never invent data absent from the source text. */
export function buildExtractionPrompt(rawText: string): string {
  return `Tu es un extracteur de CV. Voici le texte brut extrait d'un fichier PDF par un outil de parsing (la mise en page d'origine est perdue, seul le texte demeure).

## MISSION
Structure ce texte en JSON, SANS reformuler, SANS résumer, SANS inventer. Tu es un extracteur, pas un rédacteur.

## RÈGLES
- N'invente AUCUNE information absente du texte. Si un champ est introuvable, mets \`null\` (ou un tableau vide pour les listes).
- Recopie les informations telles quelles (dates, intitulés, noms d'entreprises/écoles) — ne les traduis pas, ne les reformule pas.
- Le champ "summary" est le seul où tu peux légèrement condenser un paragraphe d'accroche déjà présent dans le texte (jamais en inventer un s'il n'existe pas).

## TEXTE DU CV
${rawText.slice(0, 12000)}

## FORMAT DE SORTIE
Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas de backticks) :
{
  "fullName": "string ou null",
  "email": "string ou null",
  "phone": "string ou null",
  "location": "string ou null",
  "linkedin": "string ou null",
  "professionalTitle": "string ou null",
  "summary": "string ou null",
  "experiences": [
    { "title": "string", "company": "string", "startDate": "string", "endDate": "string", "description": "string" }
  ],
  "education": [
    { "degree": "string", "school": "string", "startDate": "string", "endDate": "string" }
  ],
  "skills": ["string"]
}`
}

const OBJECTIVE_LABELS: Record<string, string> = {
  FIND_JOB: 'Trouver un emploi',
  IMPROVE_CV: 'Améliorer mon CV',
  CAREER_CHANGE: 'Changer de carrière',
  DEVELOP_SKILLS: 'Développer mes compétences',
  NETWORK: 'Développer mon réseau',
}

const SITUATION_LABELS: Record<string, string> = {
  EMPLOYED: 'En poste',
  JOB_SEARCH: 'En recherche d’emploi',
  RECONVERSION: 'En reconversion',
  STUDENT: 'Étudiant',
}

/**
 * The three CV layouts the candidate can pick. The layout is applied client-side
 * (React templates), so the optimizer only produces structured CONTENT — never HTML.
 * Stored verbatim on `cv.template` to remember the candidate's last choice.
 */
export type CvTemplateKey = 'ATS' | 'PROFESSIONAL' | 'CREATIVE'

/** A specific offer the optimization must target. Omit for a general optimization. */
export interface CvJobContext {
  jobTitle?: string | null
  company?: string | null
  description: string
}

/**
 * When the candidate optimizes from a specific job offer, this block steers keyword
 * selection, skill ordering and phrasing toward THAT offer — strictly by re-surfacing
 * what already exists in the CV, never by inventing anything to match the offer.
 */
function buildJobTargetingSection(jobContext: CvJobContext | null | undefined): string {
  if (!jobContext) {
    return `## MODE D'OPTIMISATION : GÉNÉRALE
Optimise le CV de façon polyvalente, alignée sur l'objectif de carrière du candidat (aucune offre précise visée).`
  }

  const header = [jobContext.jobTitle, jobContext.company].filter(Boolean).join(' — ') || 'Offre ciblée'
  return `## MODE D'OPTIMISATION : CIBLÉE SUR UNE OFFRE PRÉCISE
Tu optimises ce CV POUR CETTE OFFRE UNIQUEMENT : « ${header} ».

### OFFRE CIBLE (texte de référence)
"""
${jobContext.description.slice(0, 6000)}
"""

### CONSIGNES SPÉCIFIQUES À L'OFFRE (sans jamais inventer)
- Repère les mots-clés, compétences et exigences de l'offre, puis **fais remonter en priorité** ceux qui existent DÉJÀ dans le CV du candidat.
- **Réordonne** expériences et compétences pour mettre en avant celles pertinentes pour cette offre.
- **Adapte le titre et le résumé** au poste visé, en restant fidèle au parcours réel du candidat.
- Reformule les bullets pour faire écho au vocabulaire de l'offre — MAIS uniquement à partir de faits déjà présents dans le CV.
- ❌ N'ajoute AUCUNE compétence, expérience ou qualification absente du CV juste parce que l'offre la demande. Un manque reste un manque.`
}

/**
 * Rewrites the CV content (summary, titles, bullets, skills) for ATS compatibility,
 * while forbidding invention of facts (contact, experiences, education).
 *
 * Output is STRUCTURED JSON — the visual layout is rendered client-side from this
 * data into whichever template the candidate selects, so no HTML is produced here.
 *
 * When `jobContext` is provided, the optimization is tailored to that specific offer
 * (keywords, skill ordering, phrasing) without fabricating anything to fit it.
 */
export function buildOptimizationPrompt(
  profile: Profile | null,
  extractedData: any,
  jobContext?: CvJobContext | null,
): string {
  const immutable = extractImmutableContact(extractedData, profile)
  const immutableExperiences = formatImmutableExperiences(extractedData)
  const immutableEducation = formatImmutableEducation(extractedData)

  return `Tu es un expert senior en rédaction de CV et en systèmes ATS (Applicant Tracking Systems).
Tu as 15 ans d'expérience en recrutement et tu connais parfaitement les algorithmes de parsing ATS.

## ⚠️⚠️⚠️ RÈGLES INVIOLABLES — LIS ET RESPECTE CETTE SECTION AVANT TOUT ⚠️⚠️⚠️

Ton rôle est de **reformuler** et **réorganiser** le CONTENU du CV pour mieux passer les filtres ATS.
Tu n'es PAS rédacteur fiction. Tu NE peux PAS inventer, embellir ou fabriquer des faits.

### A. INFORMATIONS DE CONTACT — RECOPIE-LES VERBATIM, NE LES MODIFIE JAMAIS
- Nom complet  : "${immutable.name ?? '(NON RENSEIGNÉ — laisse null)'}"
- Email        : "${immutable.email ?? '(NON RENSEIGNÉ — laisse null)'}"
- Téléphone    : "${immutable.phone ?? '(NON RENSEIGNÉ — laisse null)'}"
- Localisation : "${immutable.location ?? '(NON RENSEIGNÉ — laisse null)'}"
- LinkedIn     : "${immutable.linkedin ?? '(NON RENSEIGNÉ — laisse null)'}"

### B. EXPÉRIENCES PROFESSIONNELLES — LISTE FIXE
${immutableExperiences}

Pour chaque expérience tu peux :
  ✅ Réécrire la description sous forme de bullets (verbes d'action, quantification)
  ✅ Réordonner les expériences par pertinence

Tu NE peux PAS :
  ❌ Changer le nom de l'entreprise, l'intitulé du poste, ou les dates
  ❌ Ajouter ou supprimer une expérience

### C. FORMATIONS — LISTE FIXE (totalement immutable)
${immutableEducation}

Tu NE peux RIEN modifier dans les formations : ni le diplôme, ni l'établissement, ni les dates.

### D. CE QUE TU PEUX RÉELLEMENT FAIRE
  ✅ Réécrire le **résumé / profil professionnel** (2-3 phrases percutantes)
  ✅ Réécrire le **titre du poste visé**
  ✅ Transformer chaque description d'expérience en **bullets** avec verbes d'action + quantification
  ✅ **Réordonner** par pertinence
  ✅ **Ajouter des compétences** UNIQUEMENT si plausibles vu son parcours
  ✅ Déduire les **langues** et **centres d'intérêt** UNIQUEMENT s'ils apparaissent dans le CV

### E. INTERDICTIONS ABSOLUES (= MENSONGE)
  ❌ Inventer un poste, employeur, mission, diplôme, école, certification, langue
  ❌ Modifier nom, email, téléphone ou ville
  ❌ Ajouter des compétences sans lien avec le parcours réel

Si une info manque dans le CV original, OMETS-LA (null ou tableau vide). N'INVENTE JAMAIS.

${buildJobTargetingSection(jobContext)}

## PROFIL DU CANDIDAT
- Nom : ${profile?.firstName || 'Non renseigné'} ${profile?.lastName || ''}
- Niveau d'études : ${profile?.educationLevel || 'Non renseigné'}
- Secteur visé : ${profile?.sector || 'Non renseigné'}
- Statut actuel : ${(profile?.situation && SITUATION_LABELS[profile.situation]) || 'Non renseigné'}
- Objectif principal : ${(profile?.objective && OBJECTIVE_LABELS[profile.objective]) || 'Non défini'}
- Forces : ${JSON.stringify(profile?.strengths || [])}
- Compétences : ${JSON.stringify(profile?.skills || [])}

## DONNÉES CV EXTRAITES
${JSON.stringify(extractedData, null, 2)}

## RÈGLES D'OPTIMISATION
1. **Titre** : adapte le titre du poste à l'objectif réel du candidat.
2. **Résumé** : 2-3 phrases percutantes, alignées avec l'objectif "${(profile?.objective && OBJECTIVE_LABELS[profile.objective]) || 'professionnel'}".
3. **Bullets** : 3-5 bullets par expérience, chacun commençant par un verbe d'action au passé (Développé, Géré, Optimisé, Coordonné, Mis en place…).
4. **Quantification** : métriques plausibles (+X%, X projets, X personnes managées…) uniquement si crédibles.
5. **Mots-clés** : mots-clés pertinents pour le secteur "${profile?.sector || 'général'}".
6. **Compétences** : 8-20 compétences max, les plus pertinentes en premier.
7. **Dates** : recopie le format d'origine (ex. "Janvier 2023 — Présent").

## FORMAT DE SORTIE
Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas de backticks, pas de commentaires).
N'émets AUCUN HTML. La mise en page est gérée ailleurs : tu ne produis QUE du contenu structuré.

{
  "professionalTitle": "Titre du poste visé (string ou null)",
  "summary": "Résumé professionnel 2-3 phrases (string ou null)",
  "experiences": [
    {
      "title": "Intitulé EXACT du poste (non modifiable)",
      "company": "Nom EXACT de l'entreprise (non modifiable)",
      "location": "Ville ou null",
      "startDate": "Date de début EXACTE",
      "endDate": "Date de fin EXACTE ou 'Présent'",
      "bullets": ["Verbe d'action + réalisation quantifiée", "…"]
    }
  ],
  "education": [
    { "degree": "Diplôme EXACT", "school": "Établissement EXACT", "location": "Ville ou null", "startDate": "…", "endDate": "…" }
  ],
  "skills": ["compétence", "…"],
  "languages": [ { "name": "Français", "level": "Natif" } ],
  "interests": ["centre d'intérêt", "…"],
  "improvements": [
    { "category": "structure", "description": "Description de l'amélioration", "impact": "high" },
    { "category": "keywords", "description": "Description", "impact": "high" },
    { "category": "content", "description": "Description", "impact": "medium" }
  ]
}

## CATÉGORIES D'AMÉLIORATIONS POSSIBLES
"structure" (réorganisation), "keywords" (mots-clés ATS), "content" (réécriture), "skills" (compétences), "profile" (résumé professionnel)

## IMPACT LEVELS
"high" (critique pour le passage ATS), "medium" (amélioration significative), "low" (ajustement mineur)`
}
