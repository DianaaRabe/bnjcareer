import { Info } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export const JobsPreviewNotice = () => (
  <Alert variant="info">
    <Info />
    <AlertTitle>
      <FormattedMessage id="candidate.jobs.preview.title" />
    </AlertTitle>
    <AlertDescription>
      <FormattedMessage id="candidate.jobs.preview.description" />
    </AlertDescription>
  </Alert>
)
