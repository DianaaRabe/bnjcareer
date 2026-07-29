import type { Request } from 'express'
import type { User } from '@prisma/client'
import { prisma } from './lib/prisma.js'
import { verifyAccessToken } from './graphql/modules/auth/authTokenService.js'

export interface Context {
  prisma: typeof prisma
  user: User | null
}

// Built per request: decodes the Bearer token and loads the user.
export async function buildContext({ req }: { req: Request }): Promise<Context> {
  let user: User | null = null

  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    const token = header.slice(7)
    const payload = verifyAccessToken(token)
    if (payload) {
      user = await prisma.user.findUnique({ where: { id: payload.sub } })
    }
  }

  return { prisma, user }
}
