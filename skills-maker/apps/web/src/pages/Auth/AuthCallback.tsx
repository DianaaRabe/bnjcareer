import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApolloClient } from '@apollo/client'
import { Loader2, AlertCircle } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { setToken } from '@/lib/auth'
import { useAuthWithGoogleMutation } from '@/graphql/hooks/auth'
import logoFull from '@/public/logos/WhatsApp Image 2026-09-03 at 10.44.11.jpeg'

export function AuthCallback() {
  const navigate = useNavigate()
  const apolloClient = useApolloClient()
  const [authWithGoogle] = useAuthWithGoogleMutation()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    async function handleCallback() {
      try {
        // 1. Try to get the active Supabase OAuth session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        let accessToken = sessionData?.session?.access_token

        // 2. Fallback to hash parameters if getSession hasn't caught it yet
        if (!accessToken && window.location.hash) {
          const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
          accessToken = params.get('access_token') || undefined
        }

        // 3. Fallback to query parameters
        if (!accessToken && window.location.search) {
          const searchParams = new URLSearchParams(window.location.search)
          accessToken = searchParams.get('access_token') || undefined
        }

        if (sessionError && !accessToken) {
          throw new Error(sessionError.message || 'Impossible de récupérer la session Google')
        }

        if (!accessToken) {
          throw new Error('Aucun jeton d’authentification Google détecté.')
        }

        // 4. Exchange the Google/Supabase token with our Apollo GraphQL API
        const { data } = await authWithGoogle({
          variables: { input: { token: accessToken } },
        })

        if (data?.authWithGoogle.token) {
          setToken(data.authWithGoogle.token)
          await apolloClient.clearStore()

          const role = data.authWithGoogle.user.role
          if (role === 'COACH') {
            navigate('/coach', { replace: true })
          } else {
            navigate('/dashboard', { replace: true })
          }
        } else {
          throw new Error('Échec de validation de la session par le serveur.')
        }
      } catch (err: unknown) {
        console.error('Google OAuth callback error:', err)
        const msg = err instanceof Error ? err.message : 'Une erreur inattendue est survenue.'
        setErrorMessage(msg)
      }
    }

    handleCallback()
  }, [authWithGoogle, apolloClient, navigate])

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center py-1">
            <img
              src={logoFull}
              alt="BNJ Skills Maker"
              className="h-16 w-auto max-w-[200px] object-contain"
            />
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            {errorMessage ? 'Connexion interrompue' : 'Connexion en cours…'}
          </h1>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-4">
          {errorMessage ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="size-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <Button
                variant="default"
                className="w-full"
                onClick={() => navigate('/login', { replace: true })}
              >
                Retour à la page de connexion
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Finalisation de votre authentification Google…
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
