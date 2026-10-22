// ─────────────────────────────────────────────────────────────────────────────
// Lusha V3 client.
//
// Shape verified against docs.lusha.com (not memory):
//   POST /v3/contacts/prospecting  — filter search, returns ids + non-PII previews
//   POST /v3/contacts/search       — lookup by known identifiers, non-PII previews
//   POST /v3/contacts/enrich       — reveals emails (this is the step that costs credits)
//   Auth: `api_key` header. Base: https://api.lusha.com/v3/
//
// Errors are typed rather than thrown as strings because the caller has to tell a
// transient failure (retry, keep the run going) apart from a permanent one (402 out of
// credits, 451 blocked for GDPR) — skill §26 requires partial failure handling.
// ─────────────────────────────────────────────────────────────────────────────

import { env } from '@/config/env.js'
import { delay } from './concurrency.js'

const BASE_URL = 'https://api.lusha.com/v3'
const TIMEOUT_MS = 12_000
const MAX_ATTEMPTS = 3

export type LushaErrorCode =
  | 'NOT_CONFIGURED'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'OUT_OF_CREDITS'
  | 'ACCOUNT_INACTIVE'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'GDPR_BLOCKED'
  | 'TIMEOUT'
  | 'SERVER_ERROR'

export class LushaError extends Error {
  constructor(
    message: string,
    public readonly code: LushaErrorCode,
    /** True when retrying the same request could plausibly succeed. */
    public readonly retryable: boolean,
  ) {
    super(message)
    this.name = 'LushaError'
  }
}

/** Maps an HTTP status onto a typed error. 402 and 451 are permanent by design. */
function classify(status: number, body: string): LushaError {
  // The API returns `{ statusCode, message }`; the message carries the specific reason.
  let apiMessage = ''
  try {
    apiMessage = (JSON.parse(body) as { message?: string }).message ?? ''
  } catch {
    apiMessage = body.slice(0, 200)
  }
  const detail = apiMessage ? `: ${apiMessage}` : ''

  if (status === 400) return new LushaError(`Invalid Lusha request${detail}`, 'BAD_REQUEST', false)
  if (status === 401) return new LushaError(`Lusha rejected the API key${detail}`, 'UNAUTHORIZED', false)
  if (status === 402) return new LushaError(`Lusha credits exhausted${detail}`, 'OUT_OF_CREDITS', false)
  if (status === 403) return new LushaError(`Lusha account inactive${detail}`, 'ACCOUNT_INACTIVE', false)
  if (status === 404) return new LushaError(`Lusha resource not found${detail}`, 'NOT_FOUND', false)
  if (status === 429) return new LushaError(`Lusha rate limit reached${detail}`, 'RATE_LIMITED', true)
  // 451: Lusha refuses to return the data for legal reasons (GDPR). Never retry.
  if (status === 451) return new LushaError(`Lusha blocked this data for legal reasons${detail}`, 'GDPR_BLOCKED', false)

  return new LushaError(`Lusha request failed (HTTP ${status})${detail}`, 'SERVER_ERROR', status >= 500 || status === 499)
}

export function isLushaConfigured(): boolean {
  return env.LUSHA_API_KEY.trim().length > 0
}

interface LushaRequestOptions {
  method: 'GET' | 'POST'
  path: string
  body?: unknown
}

/**
 * One authenticated call, retried with exponential backoff only when the failure is
 * classified as retryable.
 */
export async function lushaRequest<T>({ method, path, body }: LushaRequestOptions): Promise<T> {
  if (!isLushaConfigured()) {
    throw new LushaError('LUSHA_API_KEY is not set', 'NOT_CONFIGURED', false)
  }

  let lastError: LushaError | null = null

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let response: Response
    try {
      response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
          api_key: env.LUSHA_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
    } catch (err) {
      const timedOut = err instanceof Error && err.name === 'TimeoutError'
      lastError = new LushaError(
        timedOut ? 'Lusha request timed out' : `Lusha request failed: ${String(err)}`,
        timedOut ? 'TIMEOUT' : 'SERVER_ERROR',
        true,
      )
      if (attempt < MAX_ATTEMPTS) await delay(2 ** attempt * 250)
      continue
    }

    if (response.ok) return (await response.json()) as T

    const text = await response.text().catch(() => '')
    lastError = classify(response.status, text)
    if (!lastError.retryable || attempt === MAX_ATTEMPTS) throw lastError
    await delay(2 ** attempt * 250)
  }

  throw lastError ?? new LushaError('Lusha request failed', 'SERVER_ERROR', true)
}

// ── Response shapes (only the fields this feature reads) ─────────────────────

export interface LushaRevealOption {
  field: string
  credits: number
}

export interface LushaContactPreview {
  id?: string
  firstName?: string
  lastName?: string
  fullName?: string
  jobTitle?: { title?: string; departments?: string[]; seniority?: string }
  company?: { id?: string; name?: string; domain?: string; industry?: string }
  canReveal?: LushaRevealOption[]
  has?: string[]
  error?: { code: string; message: string }
}

export interface LushaEmail {
  email: string
  type?: string
  /** Lusha's own grade — 'A+' is the strongest. */
  confidence?: string
  updateDate?: string
}

export interface LushaEnrichedContact {
  id: string
  firstName?: string
  lastName?: string
  fullName?: string
  emails?: LushaEmail[]
  company?: { name?: string; domain?: string }
}

interface ProspectingResponse {
  results?: LushaContactPreview[]
  pagination?: { page: number; size: number; total: number }
}

interface SearchResponse {
  results?: LushaContactPreview[]
}

interface EnrichResponse {
  results?: LushaEnrichedContact[]
}

/**
 * The values endpoint is not uniform across filter types: `seniority` returns
 * `{ id, name }` objects, while `departments` returns plain strings (confirmed against
 * the live API). Both shapes are accepted so a future format change cannot silently
 * yield an empty list — which would look like "no HR contacts" rather than an error.
 */
type FilterValue = string | { id: number | string; name?: string }

interface FilterValuesResponse {
  values?: FilterValue[]
}

/** Contact previews matching the filters. Non-PII: no emails are returned here. */
export async function lushaProspectContacts(filters: unknown, size: number): Promise<LushaContactPreview[]> {
  const response = await lushaRequest<ProspectingResponse>({
    method: 'POST',
    path: '/contacts/prospecting',
    body: { pagination: { page: 0, size }, filters, options: { includePartialProfiles: true } },
  })
  return response.results ?? []
}

/** Previews for contacts identified by name + company, when the offer names someone. */
export async function lushaSearchContacts(
  contacts: { clientReferenceId: string; firstName?: string; lastName?: string; companyDomain?: string; companyName?: string }[],
): Promise<LushaContactPreview[]> {
  const response = await lushaRequest<SearchResponse>({
    method: 'POST',
    path: '/contacts/search',
    body: { contacts, options: { includePartialProfiles: true } },
  })
  return response.results ?? []
}

/** Reveals emails for known contact ids. This is the credit-spending call. */
export async function lushaEnrichContacts(ids: string[]): Promise<LushaEnrichedContact[]> {
  if (ids.length === 0) return []
  const response = await lushaRequest<EnrichResponse>({
    method: 'POST',
    path: '/contacts/enrich',
    // Emails only: phones cost 5 credits each and are useless for an application.
    body: { ids, reveal: ['emails'] },
  })
  return response.results ?? []
}

/** Test seam for the status→error mapping, which is otherwise only reachable over HTTP. */
export const __testing = { classify }

/** Valid department names. Unrecognised filter values silently return zero results. */
export async function lushaDepartmentValues(): Promise<string[]> {
  const response = await lushaRequest<FilterValuesResponse>({
    method: 'GET',
    path: '/contacts/prospecting/filters/departments',
  })
  return (response.values ?? [])
    .map((value) => (typeof value === 'string' ? value : (value?.name ?? '')))
    .map((name) => name.trim())
    .filter(Boolean)
}
