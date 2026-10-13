import { CalendarCheck, Coins, Shield, TriangleAlert } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { LoadingState } from '@/components/common/LoadingState/LoadingState'
import { ContractText } from './components/ContractText'
import { RevenueTerm } from './components/RevenueTerm'
import { SignatureForm } from './components/SignatureForm'
import { useCoachAgreement } from './useCoachAgreement'

/** Stands outside the coach shell: there is no dashboard to frame until this is signed. */
export const CoachAgreement = () => {
  const agreement = useCoachAgreement()

  const renderBody = () => {
    if (agreement.isLoading || !agreement.terms) {
      return agreement.hasError ? (
        <EmptyState
          icon={TriangleAlert}
          titleId="coach.agreement.error.title"
          descriptionId="coach.agreement.error.unexpected"
        />
      ) : (
        <LoadingState />
      )
    }

    const { terms } = agreement

    return (
      <>
        <div className="grid grid-cols-1 gap-8 border-t border-border pt-8 md:grid-cols-2">
          <RevenueTerm
            icon={Coins}
            titleId="coach.agreement.terms.subscriptions.title"
            descriptionId="coach.agreement.terms.subscriptions.description"
            footnoteId="coach.agreement.terms.subscriptions.footnote"
            sharePct={terms.subscriptionShareCoachPct}
            remainderPct={100 - terms.subscriptionShareCoachPct}
          />
          <RevenueTerm
            icon={CalendarCheck}
            titleId="coach.agreement.terms.trainings.title"
            descriptionId="coach.agreement.terms.trainings.description"
            footnoteId="coach.agreement.terms.trainings.footnote"
            sharePct={terms.formationSharePlatformPct}
            remainderPct={100 - terms.formationSharePlatformPct}
          />
        </div>

        <ContractText />

        <SignatureForm agreement={agreement} contractVersion={terms.currentVersion} />
      </>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 flex-none items-center justify-center rounded-lg bg-accent">
              <Shield className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-[13.5px] font-semibold">
                <FormattedMessage id="coach.agreement.header.title" />
              </p>
              <p className="text-[11px] tracking-widest text-muted-foreground uppercase">
                <FormattedMessage id="app.name" />
              </p>
            </div>
          </div>

          {agreement.terms && (
            <p className="text-[12px] text-muted-foreground">
              <FormattedMessage
                id="coach.agreement.header.version"
                values={{ version: agreement.terms.currentVersion }}
              />
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            <FormattedMessage id="coach.agreement.title" />
          </h1>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground">
            <FormattedMessage id="coach.agreement.subtitle" />
          </p>
        </div>

        {renderBody()}
      </main>
    </div>
  )
}
