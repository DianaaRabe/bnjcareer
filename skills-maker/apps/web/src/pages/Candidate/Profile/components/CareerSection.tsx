import { FormattedMessage, useIntl } from 'react-intl'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ProfileSituation } from '@/gql/graphql'
import { EDUCATION_LEVEL_OPTIONS, SITUATION_OPTIONS } from '../constants'
import { IconSelectField } from './IconSelectField'

type CareerSectionProps = {
  educationLevel: string
  onEducationChange: (v: string) => void
  school: string
  onSchoolChange: (v: string) => void
  sector: string
  onSectorChange: (v: string) => void
  situation: ProfileSituation | ''
  onSituationChange: (v: ProfileSituation) => void
}

export const CareerSection = ({
  educationLevel,
  onEducationChange,
  school,
  onSchoolChange,
  sector,
  onSectorChange,
  situation,
  onSituationChange,
}: CareerSectionProps) => {
  const intl = useIntl()

  return (
    <div className="flex flex-col gap-4.5">
      <IconSelectField
        labelId="candidate.profile.career.education.label"
        value={educationLevel}
        options={EDUCATION_LEVEL_OPTIONS}
        placeholderId="candidate.profile.career.education.placeholder"
        onChange={onEducationChange}
      />
      <div className="flex flex-col gap-1.5">
        <Label>
          <FormattedMessage id="candidate.profile.career.school.label" />
        </Label>
        <Input
          placeholder={intl.formatMessage({ id: 'candidate.profile.career.school.placeholder' })}
          value={school}
          onChange={(e) => onSchoolChange(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>
          <FormattedMessage id="candidate.profile.career.sector.label" />
        </Label>
        <Input value={sector} onChange={(e) => onSectorChange(e.target.value)} />
      </div>
      <IconSelectField
        labelId="candidate.profile.career.situation.label"
        value={situation}
        options={SITUATION_OPTIONS}
        placeholderId="candidate.profile.career.situation.placeholder"
        onChange={onSituationChange}
      />
    </div>
  )
}
