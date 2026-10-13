import { FormattedMessage, useIntl } from 'react-intl'

import { ChipInput } from '@/components/common/ChipInput/ChipInput'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { AutomationFrequency } from '@/gql/graphql'
import type { useAutomationPanel } from './useAutomationPanel'

type Bounds = { maxApplicationsPerRun: number; maxApplicationsPerDay: number; minMatchScore: number }

type Props = {
  draft: NonNullable<ReturnType<typeof useAutomationPanel>['draft']>
  ceilings: Bounds | null
  patch: ReturnType<typeof useAutomationPanel>['patch']
}

const MAX_KEYWORDS = 50
const MAX_LOCATIONS = 50
const MAX_CONTRACT_TYPES = 20

/** A labelled slider bound to one numeric preference, clamped to the server ceiling. */
const SliderField = ({
  labelId,
  value,
  min,
  max,
  ceiling,
  suffix,
  onChange,
}: {
  labelId: string
  value: number
  min: number
  max: number
  ceiling: number
  suffix?: string
  onChange: (v: number) => void
}) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-baseline justify-between">
      <Label>
        <FormattedMessage id={labelId} />
      </Label>
      <span className="text-sm font-semibold text-foreground">
        {value}
        {suffix}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-primary"
    />
    <p className="text-xs text-muted-foreground">
      <FormattedMessage id="candidate.applications.settings.ceiling" values={{ ceiling: `${ceiling}${suffix ?? ''}` }} />
    </p>
  </div>
)

export const AutomationSettingsCard = ({ draft, ceilings, patch }: Props) => {
  const intl = useIntl()

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FormattedMessage id="candidate.applications.settings.title" />
        </CardTitle>
        <CardDescription>
          <FormattedMessage id="candidate.applications.settings.subtitle" />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <Label>
            <FormattedMessage id="candidate.applications.settings.frequency" />
          </Label>
          <Select
            value={draft.frequency}
            onValueChange={(v) => patch({ frequency: v as AutomationFrequency })}
          >
            <SelectTrigger className="h-11! w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={AutomationFrequency.Daily}>
                  {intl.formatMessage({ id: 'candidate.applications.settings.frequency.daily' })}
                </SelectItem>
                <SelectItem value={AutomationFrequency.Weekly}>
                  {intl.formatMessage({ id: 'candidate.applications.settings.frequency.weekly' })}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <SliderField
          labelId="candidate.applications.settings.perRun"
          value={draft.maxApplicationsPerRun}
          min={1}
          max={ceilings?.maxApplicationsPerRun ?? 20}
          ceiling={ceilings?.maxApplicationsPerRun ?? 20}
          onChange={(v) => patch({ maxApplicationsPerRun: v })}
        />
        <SliderField
          labelId="candidate.applications.settings.perDay"
          value={draft.maxApplicationsPerDay}
          min={1}
          max={ceilings?.maxApplicationsPerDay ?? 50}
          ceiling={ceilings?.maxApplicationsPerDay ?? 50}
          onChange={(v) => patch({ maxApplicationsPerDay: v })}
        />
        <SliderField
          labelId="candidate.applications.settings.minScore"
          value={draft.minMatchScore}
          min={0}
          max={ceilings?.minMatchScore ?? 95}
          ceiling={ceilings?.minMatchScore ?? 95}
          suffix="%"
          onChange={(v) => patch({ minMatchScore: v })}
        />

        <div className="flex items-start justify-between gap-4 rounded-lg bg-muted/40 p-3">
          <div className="space-y-0.5">
            <Label>
              <FormattedMessage id="candidate.applications.settings.approvalMode" />
            </Label>
            <p className="text-xs text-muted-foreground">
              <FormattedMessage id="candidate.applications.settings.approvalMode.hint" />
            </p>
          </div>
          <Switch
            checked={draft.approvalMode}
            onCheckedChange={(v) => patch({ approvalMode: v })}
            aria-label={intl.formatMessage({ id: 'candidate.applications.settings.approvalMode' })}
          />
        </div>

        <ChipInput
          labelId="candidate.applications.settings.keywords"
          hintId="candidate.applications.settings.keywords.hint"
          placeholderId="candidate.applications.settings.keywords.placeholder"
          values={draft.keywords}
          max={MAX_KEYWORDS}
          onAdd={(v) => patch({ keywords: [...draft.keywords, v.trim()].filter(Boolean) })}
          onRemove={(i) => patch({ keywords: draft.keywords.filter((_, idx) => idx !== i) })}
        />
        <ChipInput
          labelId="candidate.applications.settings.locations"
          hintId="candidate.applications.settings.locations.hint"
          placeholderId="candidate.applications.settings.locations.placeholder"
          values={draft.locations}
          max={MAX_LOCATIONS}
          onAdd={(v) => patch({ locations: [...draft.locations, v.trim()].filter(Boolean) })}
          onRemove={(i) => patch({ locations: draft.locations.filter((_, idx) => idx !== i) })}
        />
        <ChipInput
          labelId="candidate.applications.settings.contractTypes"
          hintId="candidate.applications.settings.contractTypes.hint"
          placeholderId="candidate.applications.settings.contractTypes.placeholder"
          values={draft.contractTypes}
          max={MAX_CONTRACT_TYPES}
          onAdd={(v) => patch({ contractTypes: [...draft.contractTypes, v.trim()].filter(Boolean) })}
          onRemove={(i) => patch({ contractTypes: draft.contractTypes.filter((_, idx) => idx !== i) })}
        />
      </CardContent>
    </Card>
  )
}
