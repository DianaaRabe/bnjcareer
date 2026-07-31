import { Bell, Plus } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Button } from '@/components/ui/button'

export const Dashboard = () => {
  const intl = useIntl()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrowId="coach.dashboard.eyebrow"
        titleId="coach.dashboard.title"
        descriptionId="coach.dashboard.subtitle"
        actions={
          <>
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label={intl.formatMessage({ id: 'common.notifications' })}
              className="rounded-full text-muted-foreground"
            >
              <Bell />
            </Button>
            <Button size="lg" className="gap-2 rounded-xl">
              <Plus />
              <FormattedMessage id="coach.dashboard.newSession" />
            </Button>
          </>
        }
      />

      <section className="rounded-xl border border-dashed border-border-strong bg-card p-10 text-center text-sm text-muted-foreground">
        <FormattedMessage id="coach.dashboard.empty" />
      </section>
    </div>
  )
}
