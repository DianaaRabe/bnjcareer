import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'

type ComingSoonProps = {
  titleId: string
  eyebrowId?: string
}

/** Placeholder for sections not migrated yet — remove once the real page lands. */
export const ComingSoon = ({ titleId, eyebrowId }: ComingSoonProps) => (
  <div className="flex flex-col gap-6">
    <PageHeader eyebrowId={eyebrowId} titleId={titleId} />
    <EmptyState descriptionId="common.comingSoon" />
  </div>
)
