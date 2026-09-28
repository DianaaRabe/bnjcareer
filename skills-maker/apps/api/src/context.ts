import type { Request } from 'express'
import type { User } from '@prisma/client'
import { prisma } from './lib/prisma.js'
import { verifyAccessToken } from './graphql/modules/auth/authTokenService.js'

/** Request metadata kept for signatures and other auditable actions. */
export interface AuditContext {
  ipAddress: string | null
  userAgent: string | null
}

export interface Context {
  prisma: typeof prisma
  user: User | null
  audit: AuditContext
}

// Built per request: decodes the Bearer token and loads the user.
export async function buildContext({ req }: { req: Request }): Promise<Context> {
  return contextFromAuthHeader(req.headers.authorization, {
    // Behind a proxy the client address is the first hop of the forwarded chain.
    ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ?? req.ip ?? null,
    userAgent: req.headers['user-agent'] ?? null,
  })
}

/** Shared by the HTTP middleware and the WebSocket handshake, which has no Request. */
export async function contextFromAuthHeader(
  header?: string,
  audit: AuditContext = { ipAddress: null, userAgent: null },
): Promise<Context> {
  let user: User | null = null

  if (header?.startsWith('Bearer ')) {
    const token = header.slice(7)
    const payload = verifyAccessToken(token)
    if (payload) {
      user = await prisma.user.findUnique({ where: { id: payload.sub } })
    }
  }

  return { prisma, user, audit }
}
