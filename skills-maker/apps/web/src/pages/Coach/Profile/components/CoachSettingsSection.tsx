import { Star } from 'lucide-react'
import { FormattedMessage, FormattedNumber, useIntl } from 'react-intl'

import { ChipInput } from '@/components/common/ChipInput/ChipInput'
import { FilterControl } from '@/components/common/FilterControl/FilterControl'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { CoachExpertise } from '@/gql/graphql'
import { EXPERTISE_OPTIONS, MAX_CERTIFICATIONS } from '../constants'

type CoachSettingsSectionProps = {
  specialty: string
  onSpecialtyChange: (v: string) => void
  yearsExperience: string
  onYearsExperienceChange: (v: string) => void
  certifications: string[]
  onAddCertification: (v: string) => void
  onRemoveCertification: (index: number) => void
  expertise: CoachExpertise[]
  onToggleExpertise: (value: CoachExpertise) => void
  acceptingClients: boolean
  onAcceptingClientsChange: (v: boolean) => void
  published: boolean
  onPublishedChange: (v: boolean) => void
  rating: number | null
}

export const CoachSettingsSection = ({
  specialty,
  onSpecialtyChange,
  yearsExperience,
  onYearsExperienceChange,
  certifications,
  onAddCertification,
  onRemoveCertification,
  expertise,
  onToggleExpertise,
  acceptingClients,
  onAcceptingClientsChange,
  published,
  onPublishedChange,
  rating,
}: CoachSettingsSectionProps) => {
  const intl = useIntl()

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4 rounded-xl bg-muted p-3.5">
        <div>
          <p className="text-[13.5px] font-semibold">
            <FormattedMessage id={published ? 'coach.profile.published' : 'coach.profile.draft'} />
          </p>
          <p className="text-[12px] text-muted-foreground">
            <FormattedMessage id="coach.profile.publishedHint" />
          </p>
        </div>
        <Switch checked={published} onCheckedChange={onPublishedChange} />
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl bg-muted p-3.5">
        <div>
          <p className="text-[13.5px] font-semibold">
            <FormattedMessage id="coach.profile.acceptingClients" />
          </p>
          <p className="text-[12px] text-muted-foreground">
            <FormattedMessage id="coach.profile.acceptingClientsHint" />
          </p>
        </div>
        <Switch checked={acceptingClients} onCheckedChange={onAcceptingClientsChange} />
      </div>

      {rating != null && (
        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
          <Star className="size-3.5 fill-brand-yellow text-brand-yellow" />
          <FormattedMessage id="coach.profile.rating" values={{ value: <FormattedNumber value={rating} maximumFractionDigits={1} /> }} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label>
          <FormattedMessage id="coach.profile.specialty.label" />
        </Label>
        <Input
          placeholder={intl.formatMessage({ id: 'coach.profile.specialty.placeholder' })}
          value={specialty}
          onChange={(e) => onSpecialtyChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>
          <FormattedMessage id="coach.profile.yearsExperience.label" />
        </Label>
        <Input
          type="number"
          min={0}
          className="max-w-40"
          value={yearsExperience}
          onChange={(e) => onYearsExperienceChange(e.target.value)}
        />
      </div>

      <ChipInput
        labelId="coach.profile.certifications.label"
        hintId="coach.profile.certifications.hint"
        values={certifications}
        max={MAX_CERTIFICATIONS}
        placeholderId="coach.profile.certifications.placeholder"
        onAdd={onAddCertification}
        onRemove={onRemoveCertification}
      />

      <FilterControl
        labelId="coach.profile.expertise.label"
        options={EXPERTISE_OPTIONS}
        isSelected={(value) => expertise.includes(value)}
        onSelect={onToggleExpertise}
      />
    </div>
  )
}
