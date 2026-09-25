/** Server-side floor for the pasted offer — mirrors MIN_DESCRIPTION_LENGTH in the API. */
export const MIN_DESCRIPTION_LENGTH = 100

/** Prefilled offer behind the sample shortcut. Must pass the server rules, or the demo dead-ends. */
export const SAMPLE_JOB = {
  jobUrl: 'https://candidat.francetravail.fr/offres/recherche/detail/1234567',
  jobTitle: 'Développeur React',
  company: 'TechCorp',
  description: `Nous recherchons un développeur React confirmé pour renforcer notre équipe produit (8 personnes).

Vos missions :
- Développer et maintenir nos interfaces en React et TypeScript
- Concevoir des composants réutilisables au sein de notre design system
- Optimiser les performances front (temps de chargement, rendu, accessibilité)
- Participer aux revues de code et au suivi technique des projets

Profil recherché : 3 ans d'expérience minimum en développement front, maîtrise de React, TypeScript et des tests automatisés. La connaissance de GraphQL et des outils de CI/CD est un plus. Anglais technique courant.`,
} as const

/** Server error codes → message ids. The API returns English strings, never rendered as-is. */
export const ERROR_MESSAGE_IDS: Record<string, string> = {
  MATCHING_REQUIRES_CV: 'candidate.matching.error.noCv',
  MATCHING_DESCRIPTION_TOO_SHORT: 'candidate.matching.error.description',
  BAD_USER_INPUT: 'candidate.matching.error.invalidInput',
  default: 'candidate.matching.error.unexpected',
}

/** Verdict wording thresholds, aligned with the scoring scale in the API prompt. */
export const SCORE_LEVELS = [
  { min: 85, titleId: 'candidate.matching.verdict.excellent' },
  { min: 65, titleId: 'candidate.matching.verdict.good' },
  { min: 40, titleId: 'candidate.matching.verdict.partial' },
  { min: 0, titleId: 'candidate.matching.verdict.low' },
] as const

export const scoreLevelId = (score: number) =>
  SCORE_LEVELS.find(({ min }) => score >= min)?.titleId ?? SCORE_LEVELS[SCORE_LEVELS.length - 1].titleId
