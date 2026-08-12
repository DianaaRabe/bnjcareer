import { FormattedMessage } from 'react-intl'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { JobSource } from '@/gql/graphql'
import { JOB_SOURCE_LABEL_IDS } from '../constants'

type JobSourceTabsProps = {
  sources: JobSource[]
  active: JobSource
  onChange: (source: JobSource) => void
  className?: string
}

export const JobSourceTabs = ({ sources, active, onChange, className }: JobSourceTabsProps) => (
  <Tabs
    value={active}
    onValueChange={(value) => onChange(value as JobSource)}
    className={className}
  >
    {/* Scrolls on narrow screens — a visible scrollbar would cut through the pill. */}
    <TabsList
      variant="pill"
      className="w-fit max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {sources.map((source) => (
        <TabsTrigger key={source} value={source} className="flex-none">
          <FormattedMessage id={JOB_SOURCE_LABEL_IDS[source]} />
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
)
