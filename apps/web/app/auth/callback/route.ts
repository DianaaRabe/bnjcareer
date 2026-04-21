import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    console.error('[auth/callback] Aucun code fourni dans l\'URL')
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const intendedRole = request.cookies.get('intended_role')?.value;
  const role = intendedRole === 'coach' ? 'coach' : 'candidate'
  const targetPath = role === 'coach' ? '/coach' : '/dashboard'
  const response = NextResponse.redirect(`${origin}${targetPath}`)
  
  // Clear the cookie now that we've read it
  response.cookies.set('intended_role', '', { maxAge: 0, path: '/' })

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

  // Update session to ensure RLS policies pass
  await supabase.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, bio, is_onboarded')
    .eq('id', user.id)
    .single()

  let debugState = ''
  const fullName = (user.user_metadata?.full_name as string) || ''
  const nameParts = fullName.trim().split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''
  const avatarUrl = (user.user_metadata?.avatar_url as string) || ''

  if (!existingProfile) {
    // ── NEW USER: insert profile with is_onboarded = false ──────────────
    debugState = 'inserted'
    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      avatar_url: avatarUrl,
      role: role,
      is_onboarded: false,   // Will trigger onboarding modal on first landing
    })

    if (insertError) {
      console.error('[auth/callback] Erreur création profil :', insertError)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Insert Error: ' + insertError.message)}`)
    }
  } else {
    debugState = 'updated'

    // ── EXISTING USER: check migration — reset is_onboarded if required fields missing ──
    const isMissingRequiredFields =
      !existingProfile.first_name ||
      !existingProfile.last_name

    const updatePayload: Record<string, unknown> = { role }

    if (isMissingRequiredFields) {
      // Force onboarding modal to appear again (migration case)
      updatePayload.is_onboarded = false
      debugState = 'migration'
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id)
    
    if (updateError) {
      console.error('[auth/callback] Erreur update profil :', updateError)
    }
  }

  // Build final redirect with session cookies carried over
  const targetPathWithDebug = `${targetPath}?debug=${debugState}`
  
  const finalResponse = NextResponse.redirect(`${origin}${targetPathWithDebug}`)
  request.cookies.getAll().forEach(c => finalResponse.cookies.set(c.name, c.value))
  response.cookies.getAll().forEach(c => finalResponse.cookies.set(c.name, c.value))
  
  // Clear the intended_role cookie
  finalResponse.cookies.set('intended_role', '', { maxAge: 0, path: '/' })

  return finalResponse
}
