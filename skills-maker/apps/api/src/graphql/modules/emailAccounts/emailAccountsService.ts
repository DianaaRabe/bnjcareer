import { GraphQLError } from 'graphql'
import { z } from 'zod'
import type { EmailProvider } from '@prisma/client'
import type { Context } from '@/context.js'
import { requireUser } from '@/lib/rbac.js'
import { encryptToken, isTokenCipherConfigured } from '@/lib/crypto/tokenCipher.js'

// ─────────────────────────────────────────────────────────────────────────────
// Candidate mailbox connection (skill §12, §25). Scoped to the signed-in candidate:
// every query/mutation keys on `requireUser(ctx).id`, so one candidate can never read
// or mutate another's mailbox. OAuth tokens are encrypted at rest and NEVER returned —
// the view type exposes only safe metadata (address, scopes, expiry).
// ─────────────────────────────────────────────────────────────────────────────

export interface ConnectedEmailAccountView {
  id: string
  provider: EmailProvider
  emailAddress: string
  scopes: string[]
  connectedAt: string
  tokenExpiresAt: string | null
}

/** Parse a provider-supplied expiry — accepts ISO 8601 or epoch seconds — into a Date, or null. */
function parseExpiry(raw: string | null | undefined): Date | null {
  if (!raw) return null
  const asNumber = Number(raw)
  if (Number.isFinite(asNumber) && String(asNumber) === raw.trim()) {
    // Epoch seconds (OAuth `expires_at`). Milliseconds would be absurdly far in the future.
    return new Date(asNumber * 1000)
  }
  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const connectSchema = z.object({
  provider: z.enum(['BREVO', 'GOOGLE', 'MICROSOFT']),
  emailAddress: z.string().trim().email().max(320),
  accessToken: z.string().trim().min(1).max(8192),
  refreshToken: z.string().trim().min(1).max(8192).optional().nullable(),
  expiresAt: z.string().trim().min(1).optional().nullable(),
  scopes: z.array(z.string().trim().min(1).max(256)).max(50).optional().nullable(),
})

/** Load the candidate's active mailbox (null when none, or when it was disconnected). */
export async function getMyEmailAccount(ctx: Context): Promise<ConnectedEmailAccountView | null> {
  const user = requireUser(ctx)
  const row = await ctx.prisma.candidateEmailAccount.findFirst({
    where: { candidateId: user.id, disconnectedAt: null },
    orderBy: { connectedAt: 'desc' },
  })
  if (!row) return null
  return {
    id: row.id,
    provider: row.provider,
    emailAddress: row.emailAddress,
    scopes: row.scopes,
    connectedAt: row.connectedAt.toISOString(),
    tokenExpiresAt: row.tokenExpiresAt ? row.tokenExpiresAt.toISOString() : null,
  }
}

/**
 * Persist the candidate's OAuth mailbox tokens, encrypted at rest. Upserts on the
 * `(candidateId, provider)` unique key so reconnecting refreshes credentials in place and
 * clears any previous `disconnectedAt`. Tokens are encrypted before they ever reach the DB.
 */
export async function connectEmailAccount(ctx: Context, input: unknown): Promise<ConnectedEmailAccountView> {
  const user = requireUser(ctx)

  if (!isTokenCipherConfigured()) {
    throw new GraphQLError(
      "La connexion de boîte mail n'est pas configurée sur le serveur (clé de chiffrement manquante).",
      { extensions: { code: 'PRECONDITION_FAILED' } },
    )
  }

  const parsed = connectSchema.safeParse(input)
  if (!parsed.success) {
    throw new GraphQLError('Données de connexion de boîte mail invalides.', {
      extensions: { code: 'BAD_USER_INPUT' },
    })
  }

  const data = parsed.data
  const provider = data.provider as EmailProvider
  const encryptedAccessToken = encryptToken(data.accessToken)
  const encryptedRefreshToken = data.refreshToken ? encryptToken(data.refreshToken) : null
  const tokenExpiresAt = parseExpiry(data.expiresAt)
  const scopes = data.scopes ?? []
  const now = new Date()

  const row = await ctx.prisma.candidateEmailAccount.upsert({
    where: { candidateId_provider: { candidateId: user.id, provider } },
    create: {
      candidateId: user.id,
      provider,
      emailAddress: data.emailAddress,
      encryptedAccessToken,
      encryptedRefreshToken,
      tokenExpiresAt,
      scopes,
    },
    update: {
      emailAddress: data.emailAddress,
      encryptedAccessToken,
      encryptedRefreshToken,
      tokenExpiresAt,
      scopes,
      lastRefreshAt: now,
      // Reconnecting revives a previously disconnected row.
      disconnectedAt: null,
    },
  })

  return {
    id: row.id,
    provider: row.provider,
    emailAddress: row.emailAddress,
    scopes: row.scopes,
    connectedAt: row.connectedAt.toISOString(),
    tokenExpiresAt: row.tokenExpiresAt ? row.tokenExpiresAt.toISOString() : null,
  }
}

/**
 * Disconnect the candidate's mailbox: wipe the stored credentials but keep the row, marked
 * disconnected, so a reconnect is a deliberate new action. Candidate-scoped via `updateMany`'s
 * `where`, so a foreign id touches zero rows. Idempotent: returns true even if nothing was active.
 */
export async function disconnectEmailAccount(ctx: Context): Promise<boolean> {
  const user = requireUser(ctx)
  await ctx.prisma.candidateEmailAccount.updateMany({
    where: { candidateId: user.id, disconnectedAt: null },
    data: {
      encryptedAccessToken: null,
      encryptedRefreshToken: null,
      tokenExpiresAt: null,
      scopes: [],
      disconnectedAt: new Date(),
    },
  })
  return true
}
