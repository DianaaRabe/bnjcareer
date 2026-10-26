// ─────────────────────────────────────────────────────────────────────────────
// Token cipher — AES-256-GCM encryption for candidate mailbox OAuth tokens.
//
// A candidate's Gmail/Microsoft access & refresh tokens are secrets that let the
// platform send mail on their behalf, so they are never stored in plaintext. We
// encrypt them at rest with AES-256-GCM (authenticated: tampering is detected on
// decrypt). The 32-byte key is derived from EMAIL_TOKEN_ENCRYPTION_KEY via SHA-256,
// so any passphrase length works while the cipher always gets exactly 256 bits.
//
// Wire format (single base64 string):  iv(12) || authTag(16) || ciphertext
// ─────────────────────────────────────────────────────────────────────────────

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { env } from '@/config/env.js'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // GCM standard nonce length
const AUTH_TAG_LENGTH = 16

/** Derive a stable 32-byte key from the configured passphrase, or throw if unset. */
function key(): Buffer {
  const secret = env.EMAIL_TOKEN_ENCRYPTION_KEY
  if (!secret) {
    throw new Error(
      'EMAIL_TOKEN_ENCRYPTION_KEY is not configured — refusing to handle mailbox tokens without encryption.',
    )
  }
  return createHash('sha256').update(secret).digest()
}

/** Encrypt a plaintext token into a self-describing base64 blob (iv || tag || ciphertext). */
export function encryptToken(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key(), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, ciphertext]).toString('base64')
}

/** Decrypt a blob produced by {@link encryptToken}. Throws if the key is wrong or data tampered. */
export function decryptToken(blob: string): string {
  const raw = Buffer.from(blob, 'base64')
  const iv = raw.subarray(0, IV_LENGTH)
  const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
  const ciphertext = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH)
  const decipher = createDecipheriv(ALGORITHM, key(), iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}

/** Whether mailbox-token encryption is configured (used to gate the connect mutation). */
export function isTokenCipherConfigured(): boolean {
  return Boolean(env.EMAIL_TOKEN_ENCRYPTION_KEY)
}
