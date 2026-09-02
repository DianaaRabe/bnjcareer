import { Filter, Search, Tag } from 'lucide-react'
import { useIntl } from 'react-intl'

import { FILTER_DISPLAY, FilterControl } from '@/components/common/FilterControl/FilterControl'
import { Input } from '@/components/ui/input'
import {
  CATEGORY_OPTIONS,
  LEVEL_OPTIONS,
  type CategoryFilter,
  type LevelFilter,
} from '../constants'

type TrainingFiltersProps = {
  search: string
  onSearchChange: (value: string) => void
  category: CategoryFilter
  onCategoryChange: (value: CategoryFilter) => void
  level: LevelFilter
  onLevelChange: (value: LevelFilter) => void
}

export const TrainingFilters = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  level,
  onLevelChange,
}: TrainingFiltersProps) => {
  const intl = useIntl()

  return (
    <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex items-center sm:w-[380px]">
        <Search className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={intl.formatMessage({ id: 'candidate.formations.search.placeholder' })}
          aria-label={intl.formatMessage({ id: 'candidate.formations.search.label' })}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2.5">
        <FilterControl
          display={FILTER_DISPLAY.select}
          icon={Tag}
          labelId="candidate.formations.filter.category"
          options={CATEGORY_OPTIONS}
          isSelected={(value) => value === category}
          onSelect={onCategoryChange}
        />
        <FilterControl
          display={FILTER_DISPLAY.select}
          icon={Filter}
          labelId="candidate.formations.filter.level"
          options={LEVEL_OPTIONS}
          isSelected={(value) => value === level}
          onSelect={onLevelChange}
        />
      </div>
    </div>
  )
}
