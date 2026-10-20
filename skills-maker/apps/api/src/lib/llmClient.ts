// ─────────────────────────────────────────────────────────────────────────────
// LLM Client — centralized wrapper supporting Groq & OpenRouter
//
// One place to swap providers, with automatic fallback across models and keys
// if one is rate-limited or unavailable. Ported from the legacy Next.js app
// (apps/web/lib/llm/client.ts) — fetch-based, no provider SDK required.
// ─────────────────────────────────────────────────────────────────────────────

import { env } from '@/config/env.js'

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMOptions {
  messages: LLMMessage[]
  maxTokens?: number
  temperature?: number
  jsonMode?: boolean
  referer?: string
}

export interface LLMResponse {
  content: string
  model: string
}

interface ProviderConfig {
  name: string
  endpoint: string
  /** Returns ALL available API keys for this provider (multi-key rotation supported). */
  getApiKeys: () => string[]
  models: string[]
  supportsJsonMode: boolean
  extraHeaders?: (referer?: string) => Record<string, string>
}

/** Collects keys from env, filtering out empty values. */
function collectKeys(values: (string | undefined)[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const v of values) {
    const trimmed = v?.trim()
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed)
      out.push(trimmed)
    }
  }
  return out
}

/** Fisher-Yates shuffle — returns a new array with keys in random order. */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const PROVIDERS: Record<string, ProviderConfig> = {
  groq: {
    name: 'groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    getApiKeys: () => collectKeys([env.GROQ_API_KEY, env.GROQ_API_KEY_2]),
    supportsJsonMode: true,
    // Verified live against this account: only the gpt-oss family is accessible
    // (llama/qwen/deepseek slugs all 404 for these keys).
    models: ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'],
  },
  openrouter: {
    name: 'openrouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    getApiKeys: () => collectKeys([env.OPENROUTER_API_KEY]),
    supportsJsonMode: true,
    // Verified live: the ":free" variants were discontinued (now 404). These paid
    // slugs resolve; gpt-oss is very cheap and matches the Groq models we use.
    models: [
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'meta-llama/llama-3.1-8b-instruct',
    ],
    extraHeaders: (referer) => ({
      'HTTP-Referer': referer || 'https://bnj-skills-maker.local',
      'X-Title': 'BNJ Skills Maker',
    }),
  },
}

function selectProvider(): ProviderConfig {
  const explicit = env.LLM_PROVIDER.toLowerCase()
  if (explicit && PROVIDERS[explicit]) return PROVIDERS[explicit]
  // Auto: prefer Groq if any of its keys is set, else OpenRouter
  if (PROVIDERS.groq.getApiKeys().length > 0) return PROVIDERS.groq
  return PROVIDERS.openrouter
}

/**
 * Ordered list of providers to try: the selected one first, then any OTHER
 * provider that has a key configured. This gives real cross-provider failover —
 * a Groq rate-limit burst (429 on every key) falls over to OpenRouter instead of
 * failing the whole call. When LLM_PROVIDER is pinned explicitly we honour it and
 * do NOT fall through to the other provider.
 */
function providerChain(): ProviderConfig[] {
  const explicit = env.LLM_PROVIDER.toLowerCase()
  if (explicit && PROVIDERS[explicit]) return [PROVIDERS[explicit]]

  const primary = selectProvider()
  const chain = [primary]
  for (const name of Object.keys(PROVIDERS)) {
    const p = PROVIDERS[name]
    if (p !== primary && p.getApiKeys().length > 0) chain.push(p)
  }
  return chain
}

/** Status codes that indicate "try a different key" rather than "try a different model". */
function isRateLimitOrQuota(status: number): boolean {
  return status === 429 || status === 402 || status === 403
}

export class LLMError extends Error {
  constructor(
    message: string,
    public readonly attempts: { model: string; error: string }[],
  ) {
    super(message)
    this.name = 'LLMError'
  }
}

// Iteration strategy within a single provider: for each model in the fallback
// chain, for each API key (random order) — 200 OK returns immediately;
// rate-limit/quota tries the next key for the same model; any other error moves
// on to the next model. Returns null (and records attempts) if the provider is
// fully exhausted, so the caller can fall over to the next provider.
async function tryProvider(
  provider: ProviderConfig,
  opts: LLMOptions,
  attempts: { model: string; error: string }[],
): Promise<LLMResponse | null> {
  const allKeys = provider.getApiKeys()
  if (allKeys.length === 0) return null

  const models = env.LLM_MODEL ? [env.LLM_MODEL] : provider.models

  for (const model of models) {
    const keys = shuffle(allKeys)

    for (let i = 0; i < keys.length; i++) {
      const apiKey = keys[i]
      const keyLabel = `key#${i + 1}`

      try {
        const body: Record<string, unknown> = {
          model,
          messages: opts.messages,
          temperature: opts.temperature ?? 0.3,
          max_tokens: opts.maxTokens ?? 4000,
        }
        if (opts.jsonMode && provider.supportsJsonMode) {
          body.response_format = { type: 'json_object' }
        }

        const res = await fetch(provider.endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            ...(provider.extraHeaders?.(opts.referer) ?? {}),
          },
          body: JSON.stringify(body),
        })

        if (res.ok) {
          const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
          const content = data.choices?.[0]?.message?.content
          if (!content) {
            attempts.push({ model: `${provider.name}:${model}/${keyLabel}`, error: 'empty response content' })
            break
          }
          return { content, model }
        }

        const errText = await res.text()
        attempts.push({
          model: `${provider.name}:${model}/${keyLabel}`,
          error: `HTTP ${res.status}: ${errText.slice(0, 200)}`,
        })

        if (isRateLimitOrQuota(res.status)) continue // try next key
        break // real error on this model → try next model
      } catch (err) {
        attempts.push({
          model: `${provider.name}:${model}/${keyLabel}`,
          error: err instanceof Error ? err.message : String(err),
        })
        break
      }
    }
  }

  return null
}

// Tries each provider in the chain (primary first, then any other configured
// provider) so a rate-limited/exhausted primary falls over instead of failing.
export async function callLLM(opts: LLMOptions): Promise<LLMResponse> {
  const chain = providerChain()
  if (chain.every((p) => p.getApiKeys().length === 0)) {
    throw new LLMError('No API key configured for any LLM provider', [])
  }

  const attempts: { model: string; error: string }[] = []
  for (const provider of chain) {
    const res = await tryProvider(provider, opts, attempts)
    if (res) return res
  }

  const tried = chain.map((p) => p.name).join(' → ')
  throw new LLMError(`All providers failed (${tried})`, attempts)
}

/** Parses JSON from an LLM response, tolerating markdown code fences. */
export function parseLLMJson<T = unknown>(raw: string): T {
  let str = raw.trim()

  if (str.startsWith('```')) {
    str = str.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
  }

  try {
    return JSON.parse(str) as T
  } catch {
    const match = str.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0]) as T
      } catch {
        // fall through
      }
    }
    throw new Error('Could not parse JSON from LLM response')
  }
}

/**
 * Same fallback strategy as callLLM, but yields the answer as it is produced.
 * Providers speak the OpenAI SSE dialect: `data: {json}` lines, `data: [DONE]` to close.
 */
export async function* streamLLM(opts: Omit<LLMOptions, 'jsonMode'>): AsyncGenerator<string> {
  const chain = providerChain()
  if (chain.every((p) => p.getApiKeys().length === 0)) {
    throw new LLMError('No API key configured for any LLM provider', [])
  }

  const attempts: { model: string; error: string }[] = []

  for (const provider of chain) {
    const models = env.LLM_MODEL ? [env.LLM_MODEL] : provider.models

    for (const model of models) {
      for (const apiKey of shuffle(provider.getApiKeys())) {
        const response = await fetch(provider.endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            ...(provider.extraHeaders?.(opts.referer) ?? {}),
          },
          body: JSON.stringify({
            model,
            messages: opts.messages,
            temperature: opts.temperature ?? 0.3,
            max_tokens: opts.maxTokens ?? 4000,
            stream: true,
          }),
        })

        if (!response.ok || !response.body) {
          attempts.push({ model: `${provider.name}:${model}`, error: `HTTP ${response.status}` })
          continue
        }

        yield* readSseDeltas(response.body)
        return
      }
    }
  }

  throw new LLMError('All providers failed (stream)', attempts)
}

/** Turns a provider SSE body into the successive text deltas it carries. */
async function* readSseDeltas(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader()
  const decoder = new TextDecoder('utf-8')
  // A chunk can cut a line in half — hold the tail until its newline arrives.
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue

      const payload = trimmed.slice(5).trim()
      if (payload === '[DONE]') return

      try {
        const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content
        if (delta) yield delta as string
      } catch {
        // A malformed chunk is not worth aborting the answer for.
      }
    }
  }
}
