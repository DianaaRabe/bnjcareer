// ─────────────────────────────────────────────────────────────────────────────
// LLM Client — centralized wrapper supporting Groq & OpenRouter
//
// Why this exists:
//   - One place to swap providers (today: Groq → faster free tier; later: Claude)
//   - Automatic fallback if a model is rate-limited / unavailable
//   - Consistent error handling + logging across all routes
//
// Provider selection (in order):
//   1. LLM_PROVIDER env var ("groq" | "openrouter")
//   2. Auto: prefer Groq if GROQ_API_KEY is set, else OpenRouter
//
// To migrate to Anthropic Claude later:
//   1. Add an "anthropic" provider to PROVIDERS below
//   2. Set LLM_PROVIDER=anthropic
//   3. All 3 API routes update at once with no code change
// ─────────────────────────────────────────────────────────────────────────────

export interface LLMMessage {
  role: "system" | "user" | "assistant"
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

// ── Provider definitions ─────────────────────────────────────────────────────

interface ProviderConfig {
  name: string
  endpoint: string
  /** Returns ALL available API keys for this provider (multi-key rotation supported). */
  getApiKeys: () => string[]
  models: string[]
  supportsJsonMode: boolean
  extraHeaders?: (referer?: string) => Record<string, string>
}

/** Collects keys from env, filtering out empty values. Supports up to 5 slots per provider. */
function collectKeys(envNames: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const name of envNames) {
    const v = process.env[name]?.trim()
    if (v && !seen.has(v)) {
      seen.add(v)
      out.push(v)
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
  // ── Groq ────────────────────────────────────────────────────────────────
  // Ultra-fast inference (typically <3s for full CV optimization).
  // Free tier rate limits: ~30 req/day per key on 70B (June 2026).
  // → Add up to 5 keys (GROQ_API_KEY, GROQ_API_KEY_2, ..._5) and we rotate them.
  groq: {
    name: "groq",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    getApiKeys: () => collectKeys([
      "GROQ_API_KEY",
      "GROQ_API_KEY_2",
      "GROQ_API_KEY_3",
      "GROQ_API_KEY_4",
      "GROQ_API_KEY_5",
    ]),
    supportsJsonMode: true,
    models: [
      "llama-3.3-70b-versatile",
      "deepseek-r1-distill-llama-70b",
      "llama-3.1-8b-instant",
    ],
  },
  // ── OpenRouter (legacy fallback) ─────────────────────────────────────────
  openrouter: {
    name: "openrouter",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    getApiKeys: () => collectKeys([
      "OPENROUTER_API_KEY",
      "OPENROUTER_API_KEY_2",
      "OPENROUTER_API_KEY_3",
    ]),
    supportsJsonMode: true,
    models: [
      "meta-llama/llama-3.3-70b-instruct:free",
      "qwen/qwen3-next-80b-a3b-instruct:free",
      "openai/gpt-oss-120b:free",
    ],
    extraHeaders: (referer) => ({
      "HTTP-Referer": referer || "https://bnj-skills-maker.vercel.app",
      "X-Title": "BNJ Skills Maker",
    }),
  },
}

function selectProvider(): ProviderConfig {
  const explicit = process.env.LLM_PROVIDER?.toLowerCase()
  if (explicit && PROVIDERS[explicit]) {
    return PROVIDERS[explicit]
  }
  // Auto: prefer Groq if any of its keys is set, else OpenRouter
  if (PROVIDERS.groq.getApiKeys().length > 0) return PROVIDERS.groq
  return PROVIDERS.openrouter
}

/** Status codes that indicate "try a different key" rather than "try a different model". */
function isRateLimitOrQuota(status: number): boolean {
  return status === 429 || status === 402 || status === 403
}

// ── Error class for structured handling upstream ─────────────────────────────
export class LLMError extends Error {
  constructor(
    message: string,
    public readonly attempts: { model: string; error: string }[],
  ) {
    super(message)
    this.name = "LLMError"
  }
}

// ── Main entry point (non-streaming) ─────────────────────────────────────────
//
// Iteration strategy:
//   For each model in the chain:
//     For each API key (random order):
//       - 200 OK → return
//       - 429/402/403 (rate limit / quota) → try next key
//       - any other error → break and try next model
//
// This means if Groq key #1 is exhausted, key #2 picks up automatically for the
// same model. Only if BOTH keys are exhausted do we degrade to the fallback model.
export async function callLLM(opts: LLMOptions): Promise<LLMResponse> {
  const provider = selectProvider()
  const allKeys = provider.getApiKeys()
  if (allKeys.length === 0) {
    throw new LLMError(`No API key configured for ${provider.name.toUpperCase()}`, [])
  }

  const override = process.env.LLM_MODEL
  const models = override ? [override] : provider.models
  const attempts: { model: string; error: string }[] = []

  for (const model of models) {
    const keys = shuffle(allKeys)
    let modelHadNonRateLimitError = false

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
          body.response_format = { type: "json_object" }
        }

        const res = await fetch(provider.endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            ...(provider.extraHeaders?.(opts.referer) ?? {}),
          },
          body: JSON.stringify(body),
        })

        if (res.ok) {
          const data = await res.json()
          const content = data.choices?.[0]?.message?.content
          if (!content) {
            attempts.push({ model: `${model}/${keyLabel}`, error: "empty response content" })
            modelHadNonRateLimitError = true
            break
          }
          if (attempts.length > 0) {
            console.log(`[llm:${provider.name}] succeeded with ${model} via ${keyLabel} after ${attempts.length} attempt(s)`)
          }
          return { content, model }
        }

        const errText = await res.text()
        const summary = `HTTP ${res.status}: ${errText.slice(0, 200)}`
        console.warn(`[llm:${provider.name}] ${model} ${keyLabel} failed → ${summary}`)
        attempts.push({ model: `${model}/${keyLabel}`, error: summary })

        if (isRateLimitOrQuota(res.status)) {
          // Try the next key with the same model
          continue
        }
        // Real error on this model (model down, bad request, etc.) → try next model
        modelHadNonRateLimitError = true
        break
      } catch (err: any) {
        const summary = err?.message || String(err)
        console.warn(`[llm:${provider.name}] ${model} ${keyLabel} threw → ${summary}`)
        attempts.push({ model: `${model}/${keyLabel}`, error: summary })
        modelHadNonRateLimitError = true
        break
      }
    }

    // If we exhausted all keys with rate-limit errors, continue to next model.
    // If we got a non-rate-limit error, we've already broken to next model.
    void modelHadNonRateLimitError
  }

  throw new LLMError(
    `All ${models.length} ${provider.name} model(s) × ${allKeys.length} key(s) failed`,
    attempts,
  )
}

// ── Streaming variant for chat UX ────────────────────────────────────────────
// Same multi-key + multi-model fallback strategy as callLLM.
export async function callLLMStream(opts: Omit<LLMOptions, "jsonMode">): Promise<Response> {
  const provider = selectProvider()
  const allKeys = provider.getApiKeys()
  if (allKeys.length === 0) {
    throw new LLMError(`No API key configured for ${provider.name.toUpperCase()}`, [])
  }

  const override = process.env.LLM_MODEL
  const models = override ? [override] : provider.models
  const attempts: { model: string; error: string }[] = []

  for (const model of models) {
    const keys = shuffle(allKeys)

    for (let i = 0; i < keys.length; i++) {
      const apiKey = keys[i]
      const keyLabel = `key#${i + 1}`

      const res = await fetch(provider.endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
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

      if (res.ok) {
        if (attempts.length > 0) {
          console.log(`[llm-stream:${provider.name}] succeeded with ${model} via ${keyLabel} after ${attempts.length} attempt(s)`)
        }
        return res
      }

      const errText = await res.text().catch(() => "")
      const summary = `HTTP ${res.status}: ${errText.slice(0, 200)}`
      console.warn(`[llm-stream:${provider.name}] ${model} ${keyLabel} failed → ${summary}`)
      attempts.push({ model: `${model}/${keyLabel}`, error: summary })

      if (isRateLimitOrQuota(res.status)) continue  // try next key
      break  // model is the issue, try next model
    }
  }

  throw new LLMError(
    `All ${models.length} ${provider.name} model(s) × ${allKeys.length} key(s) failed`,
    attempts,
  )
}

// ── Helper: safely parse JSON from an LLM response ───────────────────────────
export function parseLLMJson<T = any>(raw: string): T {
  let str = raw.trim()

  if (str.startsWith("```")) {
    str = str.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "")
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
    throw new Error("Could not parse JSON from LLM response")
  }
}

// ── CV Optimization extractor (schema-specific, survives malformed JSON) ────
export interface CVOptimizationResult {
  optimized_html: string
  improvements: Array<{ category: string; description: string; impact: string }>
  match_summary?: string
}

export function extractCVOptimization(raw: string): CVOptimizationResult {
  // Try clean parse first
  try {
    const parsed = parseLLMJson<any>(raw)
    return {
      optimized_html: parsed.optimized_html || "",
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      match_summary: parsed.match_summary || undefined,
    }
  } catch {
    // Fall through to schema-specific salvage
  }

  // Salvage strategy 1: extract HTML body between known markers
  let html = ""
  const divMatch = raw.match(/<div[\s\S]*<\/div>/i)
  if (divMatch) {
    html = divMatch[0]
  } else {
    const htmlFieldMatch = raw.match(/"optimized_html"\s*:\s*"([\s\S]*?)"\s*,\s*"(?:improvements|match_summary)"/)
    if (htmlFieldMatch) {
      html = htmlFieldMatch[1].replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\\\/g, "\\")
    }
  }

  let improvements: any[] = []
  const improvementsMatch = raw.match(/"improvements"\s*:\s*(\[[\s\S]*?\])/)
  if (improvementsMatch) {
    try {
      improvements = JSON.parse(improvementsMatch[1])
    } catch {
      improvements = []
    }
  }

  let matchSummary: string | undefined
  const summaryMatch = raw.match(/"match_summary"\s*:\s*"([\s\S]*?)"\s*[,}]/)
  if (summaryMatch) {
    matchSummary = summaryMatch[1].replace(/\\"/g, '"').replace(/\\n/g, "\n")
  }

  if (!html) {
    throw new Error("Could not extract HTML from LLM response")
  }

  console.warn("[llm] Used schema-specific salvage (malformed JSON recovered)")
  return { optimized_html: html, improvements, match_summary: matchSummary }
}
