// ─────────────────────────────────────────────────────────────────────────────
// Outbound HTTP that cannot be pointed at the infrastructure.
//
// Enrichment fetches a *candidate-supplied-adjacent* URL: a company website that
// came from a job board, i.e. untrusted external input. Left unguarded that is a
// server-side request forgery primitive — the classic target being a cloud
// metadata endpoint on 169.254.169.254 (skill §18, SSRF).
//
// Every hop is validated: the scheme and port, then the hostname, then each
// address it actually resolves to. Resolving before connecting is what closes the
// "looks public, resolves to 10.0.0.1" hole.
// ─────────────────────────────────────────────────────────────────────────────

import { lookup } from 'node:dns/promises'

export const DEFAULT_TIMEOUT_MS = 8_000
export const DEFAULT_MAX_BYTES = 512 * 1024

const MAX_REDIRECTS = 3
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:'])
const ALLOWED_PORTS = new Set(['', '80', '443'])

/** Hostnames that exist to hand out credentials, whatever they resolve to. */
const BLOCKED_HOSTNAMES = new Set([
  'metadata',
  'metadata.google.internal',
  'metadata.goog',
  'instance-data',
  'localhost',
  'localhost.localdomain',
])

export class UnsafeUrlError extends Error {
  constructor(url: string, reason: string) {
    super(`Refusing to fetch ${url}: ${reason}`)
    this.name = 'UnsafeUrlError'
  }
}

/** True for any address an outbound request must never be allowed to reach. */
export function isBlockedAddress(address: string): boolean {
  const bare = address.trim().toLowerCase().replace(/^\[|\]$/g, '')
  if (!bare) return true

  // IPv4-mapped/embedded forms resolve to their v4 counterpart.
  const mapped = bare.match(/(\d{1,3}(?:\.\d{1,3}){3})$/)
  if (mapped && bare.includes(':')) return isBlockedIpv4(mapped[1])

  if (bare.includes(':')) return isBlockedIpv6(bare)
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(bare)) return isBlockedIpv4(bare)

  // Anything neither v4 nor v6 that still looks like an IP is refused outright.
  return /^[\d.:a-f]+$/i.test(bare)
}

function isBlockedIpv4(address: string): boolean {
  const parts = address.split('.').map(Number)
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true
  const [a, b, c] = parts

  if (a === 0 || a === 10 || a === 127) return true // this-host, private, loopback
  if (a === 169 && b === 254) return true // link-local, incl. 169.254.169.254 metadata
  if (a === 172 && b >= 16 && b <= 31) return true // private
  if (a === 192 && b === 168) return true // private
  if (a === 192 && b === 0 && c === 0) return true // IETF protocol assignments
  if (a === 100 && b >= 64 && b <= 127) return true // CGNAT
  if (a === 198 && (b === 18 || b === 19)) return true // benchmarking
  if (a >= 224) return true // multicast and reserved

  return false
}

function isBlockedIpv6(address: string): boolean {
  const bare = address.split('%')[0]
  if (bare === '::' || bare === '::1') return true
  if (/^f[cd]/.test(bare)) return true // unique local fc00::/7
  if (/^fe[89ab]/.test(bare)) return true // link local fe80::/10
  if (/^ff/.test(bare)) return true // multicast
  return false
}

/**
 * Validates one URL without performing the request. Exported so callers can reject
 * a URL up front instead of discovering it mid-chain.
 */
export async function assertPublicUrl(rawUrl: string): Promise<URL> {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new UnsafeUrlError(rawUrl, 'not a valid absolute URL')
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    throw new UnsafeUrlError(rawUrl, `protocol ${url.protocol} is not allowed`)
  }
  if (!ALLOWED_PORTS.has(url.port)) {
    throw new UnsafeUrlError(rawUrl, `port ${url.port} is not allowed`)
  }

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (BLOCKED_HOSTNAMES.has(hostname)) throw new UnsafeUrlError(rawUrl, 'blocked hostname')
  if (isBlockedAddress(hostname)) throw new UnsafeUrlError(rawUrl, 'hostname is a private address')

  // Resolve now: the address that will be connected to is what actually matters.
  let addresses: { address: string }[]
  try {
    addresses = await lookup(hostname, { all: true, verbatim: true })
  } catch {
    throw new UnsafeUrlError(rawUrl, 'hostname did not resolve')
  }
  if (addresses.length === 0) throw new UnsafeUrlError(rawUrl, 'hostname did not resolve')
  for (const resolved of addresses) {
    if (isBlockedAddress(resolved.address)) {
      throw new UnsafeUrlError(rawUrl, `resolves to private address ${resolved.address}`)
    }
  }

  return url
}

/** Reads at most `maxBytes`, then abandons the rest of the body. */
async function readCapped(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) return ''
  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let text = ''
  let bytes = 0

  try {
    while (bytes < maxBytes) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.byteLength
      text += decoder.decode(value, { stream: true })
    }
  } finally {
    await reader.cancel().catch(() => undefined)
  }

  return text
}

export interface SafeFetchOptions {
  timeoutMs?: number
  maxBytes?: number
}

/**
 * Fetches a public URL as text with redirects, timeout and size all bounded.
 * Each redirect hop is re-validated — an attacker-controlled 302 to
 * `http://169.254.169.254/` is the usual way past a first-hop-only check.
 */
export async function safeFetchText(rawUrl: string, opts: SafeFetchOptions = {}): Promise<string> {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const maxBytes = opts.maxBytes ?? DEFAULT_MAX_BYTES

  let current = rawUrl
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const url = await assertPublicUrl(current)

    const response = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(timeoutMs),
      headers: { 'User-Agent': 'BNJ-Skills-Maker/1.0 (+job application contact lookup)' },
    })

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      await response.body?.cancel().catch(() => undefined)
      if (!location) return ''
      current = new URL(location, url).toString()
      continue
    }

    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined)
      return ''
    }

    const contentType = response.headers.get('content-type') ?? ''
    // Binary responses are never useful here and can be huge.
    if (contentType && !/text\/|html|json|xml|javascript/i.test(contentType)) {
      await response.body?.cancel().catch(() => undefined)
      return ''
    }

    return readCapped(response, maxBytes)
  }

  return ''
}
