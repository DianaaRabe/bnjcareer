import { FormattedMessage } from 'react-intl'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PROFILE_SECTIONS, type ProfileSectionId } from '../constants'

type ProfileNavProps = {
  active: ProfileSectionId
  onChange: (id: ProfileSectionId) => void
}

export const ProfileNav = ({ active, onChange }: ProfileNavProps) => (
  <Tabs
    value={active}
    onValueChange={(value) => onChange(value as ProfileSectionId)}
    className="sticky top-4 z-30 w-full"
  >
    <TabsList variant="pill">
      {PROFILE_SECTIONS.map(({ id, labelId, icon: Icon }) => (
        <TabsTrigger key={id} value={id}>
          <Icon className="size-[15px]" />
          <FormattedMessage id={labelId} />
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
)
