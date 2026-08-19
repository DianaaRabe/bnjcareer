import { Award, Code2, FileText, MessageSquare, RefreshCw, Users, type LucideIcon } from 'lucide-react'

import type { FilterOption } from '@/components/common/FilterControl/FilterControl'
import { TrainingCategory, TrainingLevel } from '@/gql/graphql'

/** Sentinel for the "no filter" option — never sent to the API. */
export const FILTER_ALL = 'ALL'

export type CategoryFilter = TrainingCategory | typeof FILTER_ALL
export type LevelFilter = TrainingLevel | typeof FILTER_ALL

export const CATEGORY_LABEL_IDS: Record<TrainingCategory, string> = {
  [TrainingCategory.Interview]: 'candidate.formations.category.interview',
  [TrainingCategory.Cv]: 'candidate.formations.category.cv',
  [TrainingCategory.CareerChange]: 'candidate.formations.category.careerChange',
  [TrainingCategory.SoftSkills]: 'candidate.formations.category.softSkills',
  [TrainingCategory.Technical]: 'candidate.formations.category.technical',
  [TrainingCategory.Leadership]: 'candidate.formations.category.leadership',
}

export const LEVEL_LABEL_IDS: Record<TrainingLevel, string> = {
  [TrainingLevel.Beginner]: 'candidate.formations.level.beginner',
  [TrainingLevel.Intermediate]: 'candidate.formations.level.intermediate',
  [TrainingLevel.Advanced]: 'candidate.formations.level.advanced',
}

export const CATEGORY_ICONS: Record<TrainingCategory, LucideIcon> = {
  [TrainingCategory.Interview]: MessageSquare,
  [TrainingCategory.Cv]: FileText,
  [TrainingCategory.CareerChange]: RefreshCw,
  [TrainingCategory.SoftSkills]: Users,
  [TrainingCategory.Technical]: Code2,
  [TrainingCategory.Leadership]: Award,
}

export const LEVEL_STYLES: Record<TrainingLevel, string> = {
  [TrainingLevel.Beginner]: 'bg-success/10 text-success',
  [TrainingLevel.Intermediate]: 'bg-brand-yellow/25 text-brand-yellow-foreground',
  [TrainingLevel.Advanced]: 'bg-destructive/10 text-destructive',
}

// Explicit order — the generated enums are alphabetical, which is not the reading order.
const CATEGORY_ORDER = [
  TrainingCategory.Interview,
  TrainingCategory.Cv,
  TrainingCategory.CareerChange,
  TrainingCategory.SoftSkills,
  TrainingCategory.Technical,
  TrainingCategory.Leadership,
]

const LEVEL_ORDER = [TrainingLevel.Beginner, TrainingLevel.Intermediate, TrainingLevel.Advanced]

export const CATEGORY_OPTIONS: FilterOption<CategoryFilter>[] = [
  { value: FILTER_ALL, labelId: 'candidate.formations.filter.category.all' },
  ...CATEGORY_ORDER.map((value) => ({
    value,
    labelId: CATEGORY_LABEL_IDS[value],
    icon: CATEGORY_ICONS[value],
  })),
]

export const LEVEL_OPTIONS: FilterOption<LevelFilter>[] = [
  { value: FILTER_ALL, labelId: 'candidate.formations.filter.level.all' },
  ...LEVEL_ORDER.map((value) => ({ value, labelId: LEVEL_LABEL_IDS[value] })),
]

const DAYS_PER_WEEK = 7

/** Whole weeks read better than "56 jours" — days stay for anything shorter or uneven. */
export const durationMessage = (durationDays: number) =>
  durationDays >= DAYS_PER_WEEK && durationDays % DAYS_PER_WEEK === 0
    ? { id: 'candidate.formations.duration.weeks', count: durationDays / DAYS_PER_WEEK }
    : { id: 'candidate.formations.duration.days', count: durationDays }
