import { Loader2 } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

type LoadingStateProps = {
  messageId?: string
}

/** Inline card shown while a section loads — page-level loading uses LoadingScreen instead. */
export const LoadingState = ({ messageId = 'common.loading' }: LoadingStateProps) => (
  <div className="flex items-center justify-center gap-2 rounded-xl border bg-card p-10 text-sm text-muted-foreground">
    <Loader2 className="size-4 animate-spin" />
    <FormattedMessage id={messageId} />
  </div>
)
