import { CheckCircle2, ExternalLink, Mail, ShieldCheck, Unlink } from 'lucide-react'
import { useState } from 'react'
import { FormattedMessage } from 'react-intl'

import { GoogleIcon } from '@/components/icons/GoogleIcon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'

export const EmailConnectionSection = () => {
  const [connecting, setConnecting] = useState(false)
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleConnectGmail = async () => {
    setConnecting(true)
    setError(null)
    try {
      // Lance le flux OAuth Google avec les scopes Gmail nécessaires (envoi et lecture pour le suivi des réponses)
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard/profile`,
          scopes: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (authError) {
        setError(authError.message)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.')
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = () => {
    setConnectedEmail(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  <FormattedMessage id="candidate.profile.emails.title" defaultMessage="Connexion de votre messagerie" />
                </CardTitle>
                <CardDescription>
                  <FormattedMessage
                    id="candidate.profile.emails.subtitle"
                    defaultMessage="Associez votre boîte email pour envoyer des candidatures avec votre propre adresse et suivre les retours des recruteurs."
                  />
                </CardDescription>
              </div>
            </div>
            {connectedEmail ? (
              <Badge variant="outline" className="gap-1.5 border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                Connectée
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Non connectée
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="rounded-xl border border-border/60 bg-muted/30 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex size-11 items-center justify-center rounded-lg border border-border bg-background shadow-xs">
                  <GoogleIcon className="size-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Google Gmail</h4>
                  <p className="text-sm text-muted-foreground">
                    {connectedEmail ? connectedEmail : 'Aucun compte Gmail connecté'}
                  </p>
                </div>
              </div>

              {connectedEmail ? (
                <Button variant="outline" size="sm" onClick={handleDisconnect} className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <Unlink className="size-4" />
                  Déconnecter
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleConnectGmail}
                  disabled={connecting}
                  className="gap-2"
                >
                  <GoogleIcon className="size-4" />
                  {connecting ? 'Connexion…' : 'Connecter Gmail'}
                </Button>
              )}
            </div>

            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          </div>

          <div className="grid gap-3.5 rounded-xl border border-border/50 p-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
              <div className="space-y-0.5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Envoi sécurisé en votre nom</span>
                <p>Les e-mails de candidature sont envoyés directement depuis votre adresse personnelle ou professionnelle.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
              <div className="space-y-0.5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Suivi intelligent des réponses</span>
                <p>Détecte les réponses des recruteurs (refus, invitation à un entretien) pour mettre à jour votre tableau de bord.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
