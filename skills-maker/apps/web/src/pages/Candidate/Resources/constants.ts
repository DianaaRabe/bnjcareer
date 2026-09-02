import {
  Download,
  ExternalLink,
  FileText,
  Globe,
  Play,
  Video,
  type LucideIcon,
} from 'lucide-react'

import type { FilterOption } from '@/components/common/FilterControl/FilterControl'
import { ResourceAccess, ResourceCategory, ResourceType } from '@/gql/graphql'

/** Sentinel for the "no filter" option — never sent to the API. */
export const FILTER_ALL = 'ALL'

export type CategoryFilter = ResourceCategory | typeof FILTER_ALL

export const CATEGORY_LABEL_IDS: Record<ResourceCategory, string> = {
  [ResourceCategory.Application]: 'candidate.resources.category.application',
  [ResourceCategory.Interview]: 'candidate.resources.category.interview',
  [ResourceCategory.Network]: 'candidate.resources.category.network',
  [ResourceCategory.Organization]: 'candidate.resources.category.organization',
  [ResourceCategory.Coaching]: 'candidate.resources.category.coaching',
  [ResourceCategory.Tools]: 'candidate.resources.category.tools',
}

export const TYPE_LABEL_IDS: Record<ResourceType, string> = {
  [ResourceType.Pdf]: 'candidate.resources.type.pdf',
  [ResourceType.Doc]: 'candidate.resources.type.doc',
  [ResourceType.Article]: 'candidate.resources.type.article',
  [ResourceType.Video]: 'candidate.resources.type.video',
  [ResourceType.Replay]: 'candidate.resources.type.replay',
}

export const TYPE_ICONS: Record<ResourceType, LucideIcon> = {
  [ResourceType.Pdf]: FileText,
  [ResourceType.Doc]: FileText,
  [ResourceType.Article]: Globe,
  [ResourceType.Video]: Video,
  [ResourceType.Replay]: Video,
}

/** Icon tint per type, so a glance tells a document from a video. */
export const TYPE_STYLES: Record<ResourceType, string> = {
  [ResourceType.Pdf]: 'bg-destructive/10 text-destructive',
  [ResourceType.Doc]: 'bg-primary/10 text-primary',
  [ResourceType.Article]: 'bg-success/10 text-success',
  [ResourceType.Video]: 'bg-primary/10 text-primary',
  [ResourceType.Replay]: 'bg-primary/10 text-primary',
}

/** What the call to action says and shows, once the resource is unlocked. */
export const TYPE_ACTIONS: Record<ResourceType, { labelId: string; icon: LucideIcon }> = {
  [ResourceType.Pdf]: { labelId: 'candidate.resources.action.download', icon: Download },
  [ResourceType.Doc]: { labelId: 'candidate.resources.action.download', icon: Download },
  [ResourceType.Article]: { labelId: 'candidate.resources.action.read', icon: ExternalLink },
  [ResourceType.Video]: { labelId: 'candidate.resources.action.watch', icon: Play },
  [ResourceType.Replay]: { labelId: 'candidate.resources.action.watch', icon: Play },
}

const CATEGORY_ORDER = [
  ResourceCategory.Application,
  ResourceCategory.Interview,
  ResourceCategory.Network,
  ResourceCategory.Organization,
  ResourceCategory.Coaching,
  ResourceCategory.Tools,
]

export const CATEGORY_OPTIONS: FilterOption<CategoryFilter>[] = [
  { value: FILTER_ALL, labelId: 'candidate.resources.filter.all' },
  ...CATEGORY_ORDER.map((value) => ({ value, labelId: CATEGORY_LABEL_IDS[value] })),
]

export const isLocked = (access: ResourceAccess) => access !== ResourceAccess.Free

const KO = 1024
const MO = 1024 * 1024

/** Megabytes past a megabyte, kilobytes below — matches how the library states file weights. */
export const sizeMessage = (sizeBytes: number) =>
  sizeBytes >= MO
    ? { id: 'candidate.resources.size.mo', value: Math.round((sizeBytes / MO) * 10) / 10 }
    : { id: 'candidate.resources.size.ko', value: Math.round(sizeBytes / KO) }

const MINUTES_PER_HOUR = 60

/** "1h 12min" past an hour, "58 min" below. */
export const durationMessage = (durationMinutes: number) =>
  durationMinutes >= MINUTES_PER_HOUR
    ? {
        id: 'candidate.resources.duration.hoursMinutes',
        values: {
          hours: Math.floor(durationMinutes / MINUTES_PER_HOUR),
          minutes: durationMinutes % MINUTES_PER_HOUR,
        },
      }
    : { id: 'candidate.resources.duration.minutes', values: { minutes: durationMinutes } }
