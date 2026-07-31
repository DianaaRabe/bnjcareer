import { FormattedMessage } from 'react-intl'

import { PageHeader } from '@/components/layout/PageHeader/PageHeader'

type ComingSoonProps = {
  titleId: string
  eyebrowId?: string
}

/** Placeholder for sections not migrated yet — remove once the real page lands. */
export const ComingSoon = ({ titleId, eyebrowId }: ComingSoonProps) => (
  <div className="flex flex-col gap-6">
    <PageHeader eyebrowId={eyebrowId} titleId={titleId} />
    <section className="rounded-xl border border-dashed border-border-strong bg-card p-10 text-center text-sm text-muted-foreground">
      <FormattedMessage id="common.comingSoon" />
    </section>
  </div>
)
