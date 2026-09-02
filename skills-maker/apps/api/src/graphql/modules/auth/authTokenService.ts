import jwt, { type SignOptions } from 'jsonwebtoken'
import type { Role } from '@prisma/client'
import { env } from '@/config/env.js'

export interface TokenPayload {
  sub: string // user id
  role: Role
}

export function signAccessToken(payload: TokenPayload): string {
  // Cast needed: jsonwebtoken v9 types expect its own StringValue type, not a plain string.
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] }
  return jwt.sign(payload, env.JWT_SECRET, options)
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}
