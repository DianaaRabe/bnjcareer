import { FormattedDate, FormattedMessage } from 'react-intl'
import { CheckCircle2, Loader2, Play, Power, Sparkles, TriangleAlert } from 'lucide-react'

import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { LoadingState } from '@/components/common/LoadingState/LoadingState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { AutomationRunsCard } from './AutomationRunsCard'
import { AutomationSettingsCard } from './AutomationSettingsCard'
import { PreparedApplicationsList } from './PreparedApplicationsList'
import { useAutomationPanel } from './useAutomationPanel'

/**
 * The automation control center: the master opt-in switch, the candidate's preferences, the recent
 * runs, and the review queue. Self-contained — owns its own loading/error states so the hub can
 * drop it into a tab without threading automation concerns through the page.
 */
export const AutomationPanel = () => {
  const vm = useAutomationPanel()

  if (vm.isLoading) return <LoadingState />

  if (vm.hasError) {
    return (
      <EmptyState
        icon={TriangleAlert}
        titleId="candidate.applications.error.title"
        descriptionId="candidate.applications.error.description"
        action={
          <Button variant="outline" size="lg" className="mt-2" onClick={vm.retry}>
            <FormattedMessage id="common.retry" />
          </Button>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* The master switch — the one explicit opt-in (skill §25). */}
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
              <Power className="size-5" />
            </span>
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground">
                <FormattedMessage
                  id={vm.enabled ? 'candidate.applications.status.on' : 'candidate.applications.status.off'}
                />
              </p>
              <p className="text-sm text-muted-foreground">
                {vm.enabled && vm.nextRunAt ? (
                  <FormattedMessage
                    id="candidate.applications.status.nextRun"
                    values={{
                      when: (
                        <FormattedDate
                          value={vm.nextRunAt}
                          day="2-digit"
                          month="short"
                          hour="2-digit"
                          minute="2-digit"
                        />
                      ),
                    }}
                  />
                ) : (
                  <FormattedMessage id="candidate.applications.status.offHint" />
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="default"
              size="sm"
              disabled={!vm.enabled || vm.isTriggering || vm.togglingEnabled}
              onClick={vm.triggerRun}
              className="gap-2 shadow-sm"
            >
              {vm.isTriggering ? (
                <>
                  <Loader2 className="size-4 animate-spin text-primary-foreground" />
                  <span>
                    <FormattedMessage id="candidate.applications.trigger.running" defaultMessage="Analyse en cours..." />
                  </span>
                </>
              ) : (
                <>
                  <Play className="size-4 fill-current" />
                  <span>
                    <FormattedMessage id="candidate.applications.trigger.button" defaultMessage="Lancer l'analyse maintenant" />
                  </span>
                </>
              )}
            </Button>
            <Switch
              checked={vm.enabled}
              disabled={vm.togglingEnabled || vm.isTriggering}
              onCheckedChange={vm.toggleEnabled}
              aria-label="toggle-automation"
            />
          </div>
        </CardContent>
      </Card>

      {/* Visual live progress card when an analysis is running on demand */}
      {vm.isTriggering && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex flex-col gap-3 py-4">
            <div className="flex items-center gap-2 font-medium text-primary">
              <Loader2 className="size-5 animate-spin" />
              <span>
                <FormattedMessage
                  id="candidate.applications.trigger.inProgressTitle"
                  defaultMessage="Recherche et préparation automatique en cours"
                />
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              <FormattedMessage
                id="candidate.applications.trigger.inProgressHint"
                defaultMessage="Notre IA explore le web, filtre les offres selon votre profil, sélectionne les meilleures correspondances et rédige vos candidatures personnalisées. Cela prend entre 10 et 30 secondes..."
              />
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 pt-1">
              <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background/80 p-2 text-xs">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">1</span>
                <span>Exploration des offres</span>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background/80 p-2 text-xs">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">2</span>
                <span>Matching IA CV & scoring</span>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background/80 p-2 text-xs">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">3</span>
                <span>Génération des lettres & préparation</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-6">
          {vm.draft && (
            <AutomationSettingsCard draft={vm.draft} ceilings={vm.ceilings} patch={vm.patch} />
          )}
          <AutomationRunsCard runs={vm.runs} />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            <FormattedMessage id="candidate.applications.review.title" />
          </h2>
          <p className="text-sm text-muted-foreground">
            <FormattedMessage id="candidate.applications.review.subtitle" />
          </p>
          {vm.preparedLoading ? (
            <LoadingState />
          ) : (
            <PreparedApplicationsList
              applications={vm.prepared}
              onCancel={vm.cancelApplication}
              onSend={vm.sendApplication}
              sendingId={vm.sendingId}
            />
          )}
        </div>
      </div>
    </div>
  )
}
