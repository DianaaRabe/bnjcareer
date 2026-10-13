// ─────────────────────────────────────────────────────────────────────────────
// Brevo transactional-email provider.
//
// Shape per the Brevo (ex-Sendinblue) transactional API:
//   POST https://api.brevo.com/v3/smtp/email
//   Auth: `api-key` header. Native `bcc`, `attachment` (base64 `content`), `replyTo`.
//
// Errors are typed like the Lusha client so the sender can tell a transient failure
// (429/5xx → retry) from a permanent one (400/401 → stop), which §26 requires. The
// mandatory BCC is asserted again here, immediately before the request is built, so no
// future refactor can route around `buildProviderInput`.
// ─────────────────────────────────────────────────────────────────────────────

import { env } from '@/config/env.js'
import { delay } from '@/lib/enrichment/concurrency.js'
import { BACKOFF_BASE_MS, MAX_SEND_ATTEMPTS } from './constants.js'
import { assertMandatoryBcc } from './buildMessage.js'
import { EmailSendError, type MailProvider, type ProviderSendInput, type SendResult } from './types.js'

const BASE_URL = 'https://api.brevo.com/v3'
const TIMEOUT_MS = 15_000

function parseAddress(value: string): { email: string; name?: string } {
  const match = value.match(/^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/)
  if (match) return { name: match[1] || undefined, email: match[2].trim() }
  return { email: value.trim() }
}

function classify(status: number, body: string): EmailSendError {
  let apiMessage = ''
  try {
    apiMessage = (JSON.parse(body) as { message?: string }).message ?? ''
  } catch {
    apiMessage = body.slice(0, 200)
  }
  const detail = apiMessage ? `: ${apiMessage}` : ''

  if (status === 400) return new EmailSendError(`Brevo rejected the message${detail}`, 'SERVER_ERROR', false)
  if (status === 401) return new EmailSendError(`Brevo rejected the API key${detail}`, 'AUTH_FAILED', false)
  if (status === 429) return new EmailSendError(`Brevo rate limit reached${detail}`, 'RATE_LIMITED', true)
  return new EmailSendError(`Brevo request failed (HTTP ${status})${detail}`, 'SERVER_ERROR', status >= 500)
}

export function createBrevoProvider(): MailProvider {
  return {
    id: 'BREVO',
    isConfigured() {
      return env.BREVO_API_KEY.trim().length > 0 && env.BREVO_SENDER_EMAIL.trim().length > 0
    },
    async send(input: ProviderSendInput): Promise<SendResult> {
      if (!this.isConfigured()) {
        throw new EmailSendError('Brevo is not configured', 'NOT_CONFIGURED', false)
      }
      // Belt and braces: never let a payload without the BCC reach the wire.
      assertMandatoryBcc(input)

      const payload = {
        sender: parseAddress(input.from),
        to: [parseAddress(input.to)],
        bcc: input.bcc.map(parseAddress),
        replyTo: input.replyTo ? parseAddress(input.replyTo) : undefined,
        subject: input.subject,
        textContent: input.text,
        htmlContent: input.html,
        attachment: input.attachments?.map((a) => ({
          name: a.filename,
          content: a.content.toString('base64'),
        })),
      }

      let lastError: EmailSendError | null = null
      for (let attempt = 1; attempt <= MAX_SEND_ATTEMPTS; attempt++) {
        let response: Response
        try {
          response = await fetch(`${BASE_URL}/smtp/email`, {
            method: 'POST',
            headers: {
              'api-key': env.BREVO_API_KEY,
              'Content-Type': 'application/json',
              Accept: 'application/json',
              // Brevo collapses identical idempotency keys, so a retry never double-delivers.
              ...(input.idempotencyKey ? { 'Idempotency-Key': input.idempotencyKey } : {}),
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(TIMEOUT_MS),
          })
        } catch (err) {
          const timedOut = err instanceof Error && err.name === 'TimeoutError'
          lastError = new EmailSendError(
            timedOut ? 'Brevo request timed out' : `Brevo request failed: ${String(err)}`,
            timedOut ? 'TIMEOUT' : 'SERVER_ERROR',
            true,
          )
          if (attempt < MAX_SEND_ATTEMPTS) await delay(BACKOFF_BASE_MS * 2 ** attempt)
          continue
        }

        if (response.ok) {
          const data = (await response.json().catch(() => ({}))) as { messageId?: string }
          return {
            provider: 'BREVO',
            providerMessageId: data.messageId ?? `brevo:${input.idempotencyKey ?? 'unknown'}`,
          }
        }

        const text = await response.text().catch(() => '')
        lastError = classify(response.status, text)
        if (!lastError.retryable || attempt === MAX_SEND_ATTEMPTS) throw lastError
        await delay(BACKOFF_BASE_MS * 2 ** attempt)
      }

      throw lastError ?? new EmailSendError('Brevo send failed', 'SERVER_ERROR', true)
    },
  }
}
