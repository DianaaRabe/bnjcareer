import { useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Button } from '@/components/ui/button'

type DeleteTrainingButtonProps = {
  isDeleting: boolean
  onConfirm: () => void
}

export const DeleteTrainingButton = ({ isDeleting, onConfirm }: DeleteTrainingButtonProps) => {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
      <div>
        <p className="text-[13.5px] font-semibold text-destructive">
          <FormattedMessage id="coach.formationDetail.danger.title" />
        </p>
        <p className="text-[12px] text-muted-foreground">
          <FormattedMessage id="coach.formationDetail.danger.description" />
        </p>
      </div>

      {confirming ? (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setConfirming(false)} disabled={isDeleting}>
            <FormattedMessage id="common.cancel" />
          </Button>
          <Button variant="destructive" size="sm" className="gap-1.5" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting && <Loader2 className="size-3.5 animate-spin" />}
            <FormattedMessage id="coach.formationDetail.danger.confirm" />
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
          <FormattedMessage id="coach.formationDetail.danger.trigger" />
        </Button>
      )}
    </div>
  )
}
