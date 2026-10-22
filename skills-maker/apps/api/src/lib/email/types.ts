// ─────────────────────────────────────────────────────────────────────────────
// Email provider vocabulary.
//
// The caller-facing `OutgoingEmail` has NO `bcc` field by design: the mandatory BCC
// is injected by the sender, so there is no place for a frontend-originated request to
// put one, nor to drop ours (skill §11). What the provider actually receives is
// `ProviderSendInput`, which carries the resolved `from` and the server-built `bcc`.
// ─────────────────────────────────────────────────────────────────────────────

export type EmailProviderName = 'BREVO' | 'GOOGLE' | 'MICROSOFT' | 'DRY_RUN'

export interface EmailAttachment {
  filename: string
  content: Buffer
  /** e.g. 'application/pdf'. */
  contentType: string
}

/**
 * What an application-sending caller supplies. Intentionally missing: `from`, `bcc`.
 * Those are decided server-side so neither can be influenced by request input.
 */
export interface OutgoingEmail {
  to: string
  subject: string
  /** Plain-text body — always required so a text-only client still renders the letter. */
  text: string
  html?: string
  attachments?: EmailAttachment[]
  /** On-domain reply address for the application. Falls back to `from` when absent. */
  replyTo?: string
}

/** The fully-resolved message a provider sends. Built only inside the sender. */
export interface ProviderSendInput extends OutgoingEmail {
  from: string
  /** Always includes {@link MANDATORY_BCC}; the sender guarantees it. */
  bcc: string[]
  /**
   * Stable per-application key. Providers that support idempotency keys use it so a retried
   * send is collapsed by the provider rather than delivered twice (skill §12).
   */
  idempotencyKey?: string
}

export interface SendResult {
  provider: EmailProviderName
  providerMessageId: string
  providerThreadId?: string
}

export type EmailErrorCode =
  | 'NOT_CONFIGURED'
  | 'INVALID_RECIPIENT'
  | 'ATTACHMENT_REJECTED'
  | 'RATE_LIMITED'
  | 'AUTH_FAILED'
  | 'TIMEOUT'
  | 'SERVER_ERROR'

export class EmailSendError extends Error {
  constructor(
    message: string,
    public readonly code: EmailErrorCode,
    /** True when retrying the identical request could plausibly succeed. */
    public readonly retryable: boolean,
  ) {
    super(message)
    this.name = 'EmailSendError'
  }
}

export interface MailProvider {
  id: EmailProviderName
  /** False when credentials are absent — the sender then refuses to use it for a live send. */
  isConfigured(): boolean
  send(input: ProviderSendInput): Promise<SendResult>
}
