import crypto from 'node:crypto'
import { GraphQLError } from 'graphql'
import { z } from 'zod'
import type { Context } from '@/context.js'
import { env } from '@/config/env.js'
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

interface GoogleUserInfo {
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
}

async function verifyGoogleOrSupabaseToken(token: string): Promise<GoogleUserInfo> {
  const supabaseUrl = env.SUPABASE_URL || 'https://ogwrtegpknihxixgptqe.supabase.co'
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd3J0ZWdwa25paHhpeGdwdHFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDMxNDYsImV4cCI6MjA5MTMxOTE0Nn0.uvEaX8gmelDNxclKFiPiCRHbBTU4zrDjtwywdWJT2cw'

  // Strategy 1: Verify via Supabase Auth endpoint
  if (supabaseUrl) {
    try {
      const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: supabaseKey,
        },
      })
      if (res.ok) {
        const user = (await res.json()) as {
          email?: string
          user_metadata?: {
            full_name?: string
            name?: string
            given_name?: string
            family_name?: string
            avatar_url?: string
            picture?: string
          }
        }
        if (user?.email) {
          const fullName = (user.user_metadata?.full_name || user.user_metadata?.name || '').trim()
          const nameParts = fullName.split(' ')
          const firstName = user.user_metadata?.given_name || (nameParts[0] || undefined)
          const lastName = user.user_metadata?.family_name || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined)
          const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || undefined

          return {
            email: user.email.toLowerCase(),
            firstName,
            lastName,
            avatarUrl,
          }
        }
      }
    } catch (e) {
      console.warn('[auth] Supabase token check error:', e)
    }
  }

  // Strategy 2: Verify direct Google ID token via tokeninfo
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`)
    if (res.ok) {
      const data = (await res.json()) as {
        email?: string
        email_verified?: string | boolean
        given_name?: string
        family_name?: string
        picture?: string
      }
      if (data?.email && (data.email_verified === 'true' || data.email_verified === true)) {
        return {
          email: data.email.toLowerCase(),
          firstName: data.given_name || undefined,
          lastName: data.family_name || undefined,
          avatarUrl: data.picture || undefined,
        }
      }
    }
  } catch (e) {
    console.warn('[auth] Google tokeninfo check error:', e)
  }

  throw new GraphQLError('Jeton d\'authentification Google invalide ou expiré.', {
    extensions: { code: 'UNAUTHENTICATED' },
  })
}

// Authenticate or register a user with Google SSO
export async function authWithGoogle(ctx: Context, input: unknown) {
  const parsed = z.object({ token: z.string().min(1) }).safeParse(input)
  if (!parsed.success) invalid(messages.invalidCredentialsFormat)

  const { token } = parsed.data
  const googleUser = await verifyGoogleOrSupabaseToken(token)
  const normalizedEmail = googleUser.email.trim().toLowerCase()

  let user = await ctx.prisma.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    include: { profile: true },
  })

  if (!user) {
    // Inscription automatique pour un nouvel utilisateur
    const randomPassword = crypto.randomUUID()
    const passwordHash = await hashPassword(randomPassword)

    try {
      user = await ctx.prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          role: 'CANDIDATE',
          profile: {
            create: {
              firstName: googleUser.firstName,
              lastName: googleUser.lastName,
              avatarUrl: googleUser.avatarUrl,
            },
          },
        },
        include: { profile: true },
      })
    } catch (createErr: any) {
      // En cas de création concurrente (ex: double invocation de React StrictMode), recharger l'utilisateur
      if (createErr.code === 'P2002') {
        user = await ctx.prisma.user.findFirst({
          where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
          include: { profile: true },
        })
      }
      if (!user) throw createErr
    }
  }

  if (user && user.profile && (!user.profile.avatarUrl || !user.profile.firstName)) {
    // Compléter le profil si certaines informations manquaient
    await ctx.prisma.profile.update({
      where: { id: user.profile.id },
      data: {
        avatarUrl: user.profile.avatarUrl || googleUser.avatarUrl,
        firstName: user.profile.firstName || googleUser.firstName,
        lastName: user.profile.lastName || googleUser.lastName,
      },
    })
  }

  return { token: signAccessToken({ sub: user.id, role: user.role }), user }
}

