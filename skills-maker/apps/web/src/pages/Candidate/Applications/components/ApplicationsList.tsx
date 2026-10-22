import { Inbox } from 'lucide-react'

import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { FilterControl, type FilterOption } from '@/components/common/FilterControl/FilterControl'
import { ApplicationSource, ApplicationStatus } from '@/gql/graphql'
import { ApplicationCard } from './ApplicationCard'
import {
  FILTER_ALL,
  type CandidateApplication,
  type SourceFilter,
  type StatusFilter,
} from '../useApplicationsHub'

type Props = {
  applications: CandidateApplication[]
  source: SourceFilter
  status: StatusFilter
  onSourceChange: (value: SourceFilter) => void
  onStatusChange: (value: StatusFilter) => void
  onSend: (id: string) => void
  sendingId: string | null
}

const SOURCE_OPTIONS: FilterOption<SourceFilter>[] = [
  { value: FILTER_ALL, labelId: 'candidate.applications.filter.all' },
  { value: ApplicationSource.Manual, labelId: 'candidate.applications.source.manual' },
  { value: ApplicationSource.Automated, labelId: 'candidate.applications.source.automated' },
]

const STATUS_OPTIONS: FilterOption<StatusFilter>[] = [
  { value: FILTER_ALL, labelId: 'candidate.applications.filter.all' },
  { value: ApplicationStatus.Sent, labelId: 'candidate.applications.statusLabel.SENT' },
  { value: ApplicationStatus.Pending, labelId: 'candidate.applications.statusLabel.PENDING' },
  { value: ApplicationStatus.Interview, labelId: 'candidate.applications.statusLabel.INTERVIEW' },
  { value: ApplicationStatus.Rejected, labelId: 'candidate.applications.statusLabel.REJECTED' },
]

/** The unified history: manual + automated applications, filterable by source and tracking status. */
export const ApplicationsList = ({
  applications,
  source,
  status,
  onSourceChange,
  onStatusChange,
  onSend,
  sendingId,
}: Props) => (
  <div className="flex flex-col gap-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
      <FilterControl
        labelId="candidate.applications.filter.source"
        options={SOURCE_OPTIONS}
        isSelected={(value) => value === source}
        onSelect={onSourceChange}
      />
      <FilterControl
        labelId="candidate.applications.filter.status"
        options={STATUS_OPTIONS}
        isSelected={(value) => value === status}
        onSelect={onStatusChange}
      />
    </div>

    {applications.length === 0 ? (
      <EmptyState
        icon={Inbox}
        titleId="candidate.applications.list.empty.title"
        descriptionId="candidate.applications.list.empty.description"
      />
    ) : (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {applications.map((app) => (
          <ApplicationCard
            key={app.id}
            app={app}
            onSend={onSend}
            isSending={sendingId === app.id}
          />
        ))}
      </div>
    )}
  </div>
)
