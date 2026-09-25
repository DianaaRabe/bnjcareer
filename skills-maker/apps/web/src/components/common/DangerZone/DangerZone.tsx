import { useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Button } from '@/components/ui/button'

type DangerZoneProps = {
  titleId: string
  descriptionId: string
  triggerId: string
  confirmId: string
  isLoading: boolean
  onConfirm: () => void
}

/** Title + description + two-step destructive confirm, for any "delete this thing" section. */
export const DangerZone = ({ titleId, descriptionId, triggerId, confirmId, isLoading, onConfirm }: DangerZoneProps) => {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="flex flex-col gap-3 border-t border-destructive/30 pt-6">
      <div>
        <p className="text-[13.5px] font-semibold text-destructive">
          <FormattedMessage id={titleId} />
        </p>
        <p className="text-[12px] text-muted-foreground">
          <FormattedMessage id={descriptionId} />
        </p>
      </div>

      {confirming ? (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setConfirming(false)} disabled={isLoading}>
            <FormattedMessage id="common.cancel" />
          </Button>
          <Button variant="destructive" size="sm" className="gap-1.5" onClick={onConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="size-3.5 animate-spin" />}
            <FormattedMessage id={confirmId} />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-fit gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={() => setConfirming(true)}
        >
          <Trash2 className="size-3.5" />
          <FormattedMessage id={triggerId} />
        </Button>
      )}
    </div>
  )
}
