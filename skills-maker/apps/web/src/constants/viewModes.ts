import { LayoutGrid, List, type LucideIcon } from 'lucide-react'

export const VIEW_MODE = { grid: 'grid', list: 'list' } as const

export type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE]

/** Default options for a grid/list `ViewToggle` — pass your own for other pairs. */
export const VIEW_MODE_OPTIONS: { id: ViewMode; labelId: string; icon: LucideIcon }[] = [
  { id: VIEW_MODE.grid, labelId: 'common.view.grid', icon: LayoutGrid },
  { id: VIEW_MODE.list, labelId: 'common.view.list', icon: List },
]
