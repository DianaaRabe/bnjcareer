import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Client Supabase pour les Server Components et les Route Handlers standard.
 * Pour le callback OAuth (PKCE), utiliser directement createServerClient
 * avec les cookies de la NextRequest — voir app/auth/callback/route.ts.
 */
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll peut être appelé depuis un Server Component en lecture seule.
            // Ignoré car le middleware rafraîchit la session via les cookies.
          }
        },
      },
    }
  )
}
