import { Download, ExternalLink, Play, type LucideIcon } from 'lucide-react'

import { ResourceAccess, ResourceType } from '@/gql/graphql'

export {
  FILTER_ALL,
  type CategoryFilter,
  CATEGORY_LABEL_IDS,
  TYPE_LABEL_IDS,
  TYPE_ICONS,
  TYPE_STYLES,
  CATEGORY_OPTIONS,
  sizeMessage,
  durationMessage,
} from '@/constants/resources'

/** What the call to action says and shows, once the resource is unlocked. */
export const TYPE_ACTIONS: Record<ResourceType, { labelId: string; icon: LucideIcon }> = {
  [ResourceType.Pdf]: { labelId: 'candidate.resources.action.download', icon: Download },
  [ResourceType.Doc]: { labelId: 'candidate.resources.action.download', icon: Download },
  [ResourceType.Article]: { labelId: 'candidate.resources.action.read', icon: ExternalLink },
  [ResourceType.Video]: { labelId: 'candidate.resources.action.watch', icon: Play },
  [ResourceType.Replay]: { labelId: 'candidate.resources.action.watch', icon: Play },
}

export const isLocked = (access: ResourceAccess) => access !== ResourceAccess.Free
