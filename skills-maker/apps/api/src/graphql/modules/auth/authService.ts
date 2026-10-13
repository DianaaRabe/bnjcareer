import { GraphQLError } from 'graphql'
import { z } from 'zod'
import type { Context } from '@/context.js'
import { hashPassword, verifyPassword } from '@/lib/auth.js'
import { signAccessToken } from './authTokenService.js'
import { messages } from '@/constants/messages.js'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

function invalid(message: string): never {
  throw new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } })
}

// Create the user + profile, return an access token.
export async function register(ctx: Context, input: unknown) {
  const parsed = credentialsSchema.safeParse(input)
  if (!parsed.success) invalid(messages.invalidCredentialsFormat)

  const { email, password } = parsed.data

  const existing = await ctx.prisma.user.findUnique({ where: { email } })
  if (existing) invalid(messages.emailAlreadyExists)

  const user = await ctx.prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      profile: { create: {} },
    },
  })

  return { token: signAccessToken({ sub: user.id, role: user.role }), user }
}

// Verify credentials, return an access token.
export async function login(ctx: Context, input: unknown) {
  const parsed = credentialsSchema.safeParse(input)
  if (!parsed.success) invalid(messages.invalidCredentialsFormat)

  const { email, password } = parsed.data

  const user = await ctx.prisma.user.findUnique({ where: { email } })
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    invalid(messages.incorrectCredentials)
  }

  return { token: signAccessToken({ sub: user.id, role: user.role }), user }
}
