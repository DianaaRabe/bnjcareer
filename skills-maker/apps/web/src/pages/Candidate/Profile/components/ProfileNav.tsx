import { FormattedMessage } from 'react-intl'

import { PROFILE_SECTIONS, type ProfileSectionId } from '../constants'

type ProfileNavProps = {
  active: ProfileSectionId
  onChange: (id: ProfileSectionId) => void
}

export const ProfileNav = ({ active, onChange }: ProfileNavProps) => (
  <nav className="sticky top-4 z-30 inline-flex w-fit flex-wrap gap-0.5 rounded-full bg-muted p-1">
    {PROFILE_SECTIONS.map(({ id, labelId, icon: Icon }) => {
      const isActive = id === active
      return (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`flex items-center gap-2 rounded-full px-4.5 py-2.5 text-[13.5px] font-semibold transition-colors ${
            isActive ? 'bg-card text-foreground shadow-xs' : 'bg-transparent text-muted-foreground'
          }`}
        >
          <Icon className="size-[15px]" />
          <FormattedMessage id={labelId} />
        </button>
      )
    })}
  </nav>
)
