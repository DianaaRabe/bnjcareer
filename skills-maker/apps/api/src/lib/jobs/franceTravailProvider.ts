// ─────────────────────────────────────────────────────────────────────────────
// France Travail — official "Offres d'emploi v2" API (france.travail.io)
// OAuth2 client credentials, ~300k live offers, France only.
// ─────────────────────────────────────────────────────────────────────────────

import { env } from '@/config/env.js'
import { parseSalary } from './salaryParsing.js'
import {
  CONTRACT_TYPE,
  EXPERIENCE_LEVEL,
  JOB_FILTER_KIND,
  JOB_SOURCE,
  POSTED_WITHIN,
  WORK_TIME,
  type ContractType,
  type ExperienceLevel,
  type JobProvider,
  type JobSearchOutcome,
  type JobSearchQuery,
  type NormalizedJob,
  type PostedWithin,
  type WorkTime,
} from './types.js'

const TOKEN_URL = 'https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire'
const SEARCH_URL = 'https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search'
const SCOPE = 'api_offresdemploiv2 o2dsoffre'
const COMMUNE_LOOKUP_URL = 'https://geo.api.gouv.fr/communes'
/** Radius in km around the resolved commune. */
const SEARCH_DISTANCE_KM = 20
const TOKEN_EXPIRY_MARGIN_MS = 60_000

interface FranceTravailOffer {
  id: string
  intitule?: string
  description?: string
  dateCreation?: string
  lieuTravail?: { libelle?: string }
  entreprise?: { nom?: string }
  typeContratLibelle?: string
  experienceLibelle?: string
  secteurActiviteLibelle?: string
  dureeTravailLibelleConverti?: string
  salaire?: { libelle?: string }
  origineOffre?: { urlOrigine?: string }
  alternance?: boolean
}

// Codes from the API's own referentials (GET /referentiel/typesContrats).
// APPRENTICESHIP has no contract code — it is expressed through natureContrat below.
const CONTRACT_CODES: Partial<Record<ContractType, string>> = {
  [CONTRACT_TYPE.permanent]: 'CDI',
  [CONTRACT_TYPE.fixedTerm]: 'CDD',
  [CONTRACT_TYPE.temporary]: 'MIS',
  [CONTRACT_TYPE.seasonal]: 'SAI',
  [CONTRACT_TYPE.freelance]: 'LIB',
}

/**
 * Work-study covers both apprenticeship (E2) and professionalisation (FS) contracts.
 * The documented `alternance=true` flag is silently ignored by the API — verified against
 * the live endpoint — so filter on natureContrat instead.
 */
const WORK_STUDY_NATURE_CODES = 'E2,FS'

const EXPERIENCE_CODES: Record<ExperienceLevel, string> = {
  [EXPERIENCE_LEVEL.entry]: '1',
  [EXPERIENCE_LEVEL.junior]: '2',
  [EXPERIENCE_LEVEL.senior]: '3',
}

const WORK_TIME_CODES: Record<WorkTime, string> = {
  [WORK_TIME.fullTime]: '1',
  [WORK_TIME.partTime]: '2',
}

const POSTED_WITHIN_DAYS: Record<PostedWithin, string> = {
  [POSTED_WITHIN.day]: '1',
  [POSTED_WITHIN.threeDays]: '3',
  [POSTED_WITHIN.week]: '7',
  [POSTED_WITHIN.month]: '31',
}

let cachedToken: { value: string; expiresAt: number } | null = null
const communeCodeCache = new Map<string, string | null>()

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: env.FRANCE_TRAVAIL_CLIENT_ID,
    client_secret: env.FRANCE_TRAVAIL_CLIENT_SECRET,
    scope: SCOPE,
  })

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    throw new Error(`France Travail auth failed (${res.status})`)
  }

  const json = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000 - TOKEN_EXPIRY_MARGIN_MS,
  }
  return cachedToken.value
}

/** The API filters on INSEE codes, not city names — geo.api.gouv.fr does the translation. */
async function resolveCommuneCode(location: string): Promise<string | null> {
  const key = location.trim().toLowerCase()
  if (!key) return null
  if (communeCodeCache.has(key)) return communeCodeCache.get(key) ?? null

  let code: string | null = null
  try {
    const url = `${COMMUNE_LOOKUP_URL}?nom=${encodeURIComponent(key)}&fields=code&boost=population&limit=1`
    const res = await fetch(url)
    if (res.ok) {
      const communes = (await res.json()) as { code?: string }[]
      code = communes[0]?.code ?? null
    }
  } catch {
    // Location filtering is a nice-to-have: fall back to a nationwide search.
    code = null
  }

  communeCodeCache.set(key, code)
  return code
}

/** "offres 0-19/1234" → 1234 */
function parseTotal(contentRange: string | null): number | null {
  const total = contentRange?.split('/')[1]
  const parsed = total ? Number(total) : NaN
  return Number.isFinite(parsed) ? parsed : null
}

function toNormalizedJob(offer: FranceTravailOffer): NormalizedJob {
  const tags = [
    offer.typeContratLibelle,
    offer.experienceLibelle,
    offer.dureeTravailLibelleConverti,
    offer.secteurActiviteLibelle,
  ].filter((tag): tag is string => Boolean(tag?.trim()))

  return {
    id: `${JOB_SOURCE.franceTravail}:${offer.id}`,
    source: JOB_SOURCE.franceTravail,
    title: offer.intitule?.trim() || 'Offre sans intitulé',
    company: offer.entreprise?.nom?.trim() || null,
    location: offer.lieuTravail?.libelle?.trim() ?? '',
    description: offer.description?.trim() ?? '',
    applyUrl:
      offer.origineOffre?.urlOrigine ??
      `https://candidat.francetravail.fr/offres/recherche/detail/${offer.id}`,
    postedAt: offer.dateCreation ?? null,
    salary: parseSalary(offer.salaire?.libelle),
    tags: tags.slice(0, 4),
    // The API exposes no remote flag; guessing from the wording produces false positives.
    isRemote: false,
  }
}

export const franceTravailProvider: JobProvider = {
  id: JOB_SOURCE.franceTravail,

  isConfigured: () => Boolean(env.FRANCE_TRAVAIL_CLIENT_ID && env.FRANCE_TRAVAIL_CLIENT_SECRET),

  supportedFilters: [
    JOB_FILTER_KIND.contractType,
    JOB_FILTER_KIND.experienceLevel,
    JOB_FILTER_KIND.workTime,
    JOB_FILTER_KIND.postedWithin,
  ],

  async search(query: JobSearchQuery): Promise<JobSearchOutcome> {
    const { keywords, location, limit, contractTypes, experienceLevel, workTime, postedWithin } = query
    const token = await getAccessToken()

    const params = new URLSearchParams({ range: `0-${Math.max(limit - 1, 0)}` })
    if (keywords?.trim()) params.set('motsCles', keywords.trim())

    const contractCodes = (contractTypes ?? [])
      .map((type) => CONTRACT_CODES[type])
      .filter((code): code is string => Boolean(code))
    if (contractCodes.length > 0) params.set('typeContrat', contractCodes.join(','))
    if (contractTypes?.includes(CONTRACT_TYPE.apprenticeship)) {
      params.set('natureContrat', WORK_STUDY_NATURE_CODES)
    }

    if (experienceLevel) params.set('experience', EXPERIENCE_CODES[experienceLevel])
    if (workTime) params.set('dureeHebdo', WORK_TIME_CODES[workTime])
    if (postedWithin) params.set('publieeDepuis', POSTED_WITHIN_DAYS[postedWithin])

    if (location?.trim()) {
      const communeCode = await resolveCommuneCode(location)
      if (communeCode) {
        params.set('commune', communeCode)
        params.set('distance', String(SEARCH_DISTANCE_KM))
      }
    }

    const res = await fetch(`${SEARCH_URL}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    // 204 means the filters matched nothing; 206 is a normal partial page.
    if (res.status === 204) return { jobs: [], total: 0 }
    if (!res.ok && res.status !== 206) {
      throw new Error(`France Travail search failed (${res.status})`)
    }

    const json = (await res.json()) as { resultats?: FranceTravailOffer[] }
    return {
      jobs: (json.resultats ?? []).map(toNormalizedJob),
      total: parseTotal(res.headers.get('content-range')),
    }
  },
}

export const __testing = { toNormalizedJob, parseTotal }
