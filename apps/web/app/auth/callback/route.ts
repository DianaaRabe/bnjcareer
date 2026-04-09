import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    console.error('[auth/callback] Aucun code fourni dans l\'URL')
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  // La response est préparée avant exchangeCodeForSession pour que
  // les cookies de session puissent être écrits directement dedans.
  const response = NextResponse.redirect(`${origin}/dashboard`)

  // Le client Supabase lit le code_verifier depuis les cookies de la REQUEST
  // et écrit les tokens de session dans la RESPONSE.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { error, data } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    console.error('[auth/callback] Échec de l\'échange de code :', error)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error?.message || 'Session vide')}`
    )
  }

  // ── Auto-inscription : créer le profil si c'est la première connexion ──
  const user = data.session.user

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!existingProfile) {
    const fullName = (user.user_metadata?.full_name as string) || ''
    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''
    const avatarUrl = (user.user_metadata?.avatar_url as string) || ''

    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      avatar_url: avatarUrl,
      role: 'candidate',
    })

    if (insertError) {
      // On logue mais on ne bloque pas — l'utilisateur est quand même connecté
      console.error('[auth/callback] Erreur création profil :', insertError)
    }
  }

  // Redirige vers le dashboard avec les cookies de session dans la response
  return response
}
