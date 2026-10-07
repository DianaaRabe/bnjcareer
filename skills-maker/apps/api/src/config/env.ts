import 'dotenv/config'
import { z } from 'zod'

// Validate env vars at startup — refuse to boot if a required key is missing.
const schema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  PORT: z.coerce.number().default(4100),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // LLM providers — optional, callLLM() throws only when actually invoked without a key.
  GROQ_API_KEY: z.string().optional().default(''),
  GROQ_API_KEY_2: z.string().optional().default(''),
  OPENROUTER_API_KEY: z.string().optional().default(''),
  LLM_PROVIDER: z.string().optional().default(''),
  LLM_MODEL: z.string().optional().default(''),

  // Job providers — optional; a source is hidden from the client when its keys are missing.
  APIFY_API_TOKEN: z.string().optional().default(''),
  APIFY_API_TOKEN_HELLOWORK: z.string().optional().default(''),
  FRANCE_TRAVAIL_CLIENT_ID: z.string().optional().default(''),
  FRANCE_TRAVAIL_CLIENT_SECRET: z.string().optional().default(''),
  JOOBLE_API_KEY: z.string().optional().default(''),

  // Contact enrichment — optional; the Lusha provider is skipped when the key is absent.
  LUSHA_API_KEY: z.string().optional().default(''),

  // Application email sending (skill §12). Optional: when BREVO_API_KEY is absent the real
  // provider is unconfigured and the sender falls back to the dry-run provider, which never
  // touches the network. EMAIL_SEND_LIVE must be the literal "true" to allow a real send —
  // every other value (including unset) keeps the strict dry-run default required by §34.11.
  BREVO_API_KEY: z.string().optional().default(''),
  BREVO_SMTP_API_KEY: z.string().optional().default(''),
  BREVO_SENDER_EMAIL: z.string().optional().default(''),
  EMAIL_SEND_LIVE: z.string().optional().default('false'),

  // Shared secret for the internal automation-cron trigger (skill §17). The endpoint is an
  // admin/worker seam, never a candidate route: when this is empty the route refuses every
  // request (503), so automation cannot be driven in an environment that did not opt in.
  AUTOMATION_CRON_SECRET: z.string().optional().default(''),

  UPLOAD_DIR: z.string().default('./uploads'),
  /** Pre-downloaded Apify datasets served as the browse-mode preview. */
  JOBS_RUNS_DIR: z.string().default('./data/runs'),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
