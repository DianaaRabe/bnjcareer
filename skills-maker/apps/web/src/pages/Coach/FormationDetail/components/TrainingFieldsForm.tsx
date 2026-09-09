import type { FormEvent } from 'react'
import { Loader2, Save, TriangleAlert } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { CATEGORY_LABEL_IDS, CATEGORY_ORDER, LEVEL_LABEL_IDS, LEVEL_ORDER } from '@/constants/trainings'
import type { useFormationDetail } from '../useFormationDetail'

type TrainingFieldsFormProps = {
  detail: ReturnType<typeof useFormationDetail>
}

export const TrainingFieldsForm = ({ detail }: TrainingFieldsFormProps) => {
  const intl = useIntl()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    detail.save()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-4 rounded-xl bg-muted p-3.5">
        <div>
          <p className="text-[13.5px] font-semibold">
            <FormattedMessage
              id={detail.training?.published ? 'coach.formationDetail.published' : 'coach.formationDetail.draft'}
            />
          </p>
          <p className="text-[12px] text-muted-foreground">
            <FormattedMessage id="coach.formationDetail.publishedHint" />
          </p>
        </div>
        <Switch checked={detail.training?.published ?? false} onCheckedChange={detail.togglePublished} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="formation-title">
          <FormattedMessage id="coach.formationDetail.field.title" />
        </Label>
        <Input
          id="formation-title"
          value={detail.title}
          onChange={(event) => detail.setTitle(event.target.value)}
          disabled={detail.isSaving}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="formation-description">
          <FormattedMessage id="coach.formationDetail.field.description" />
        </Label>
        <Textarea
          id="formation-description"
          value={detail.description}
          onChange={(event) => detail.setDescription(event.target.value)}
          disabled={detail.isSaving}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>
            <FormattedMessage id="coach.formationDetail.field.category" />
          </Label>
          <Select
            value={detail.category}
            onValueChange={(value) => detail.setCategory(value as typeof detail.category)}
            disabled={detail.isSaving}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {CATEGORY_ORDER.map((value) => (
                  <SelectItem key={value} value={value}>
                    <FormattedMessage id={CATEGORY_LABEL_IDS[value]} />
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>
            <FormattedMessage id="coach.formationDetail.field.level" />
          </Label>
          <Select
            value={detail.level}
            onValueChange={(value) => detail.setLevel(value as typeof detail.level)}
            disabled={detail.isSaving}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {LEVEL_ORDER.map((value) => (
                  <SelectItem key={value} value={value}>
                    <FormattedMessage id={LEVEL_LABEL_IDS[value]} />
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="formation-duration">
            <FormattedMessage id="coach.formationDetail.field.durationDays" />
          </Label>
          <Input
            id="formation-duration"
            type="number"
            min={1}
            value={detail.durationDays}
            onChange={(event) => detail.setDurationDays(Number(event.target.value))}
            disabled={detail.isSaving}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="formation-price">
            <FormattedMessage id="coach.formationDetail.field.priceCents" />
          </Label>
          <Input
            id="formation-price"
            type="number"
            min={0}
            placeholder={intl.formatMessage({ id: 'coach.formationDetail.field.priceFree' })}
            value={detail.priceCents}
            onChange={(event) => detail.setPriceCents(event.target.value)}
            disabled={detail.isSaving}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="formation-instructor">
          <FormattedMessage id="coach.formationDetail.field.instructor" />
        </Label>
        <Input
          id="formation-instructor"
          value={detail.instructor}
          onChange={(event) => detail.setInstructor(event.target.value)}
          disabled={detail.isSaving}
        />
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2">
        <Switch checked={detail.certificate} onCheckedChange={detail.setCertificate} disabled={detail.isSaving} />
        <span className="text-[13.5px] font-medium">
          <FormattedMessage id="coach.formationDetail.field.certificate" />
        </span>
      </label>

      {detail.saveErrorMessageId && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3">
          <TriangleAlert className="mt-0.5 size-4 flex-none text-destructive" />
          <p className="text-[13px] text-destructive">
            <FormattedMessage id={detail.saveErrorMessageId} />
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" className="gap-2" disabled={!detail.canSave}>
          {detail.isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          <FormattedMessage id="coach.formationDetail.save" />
        </Button>
        {detail.justSaved && !detail.isSaving && (
          <span className="text-[12.5px] font-semibold text-success">
            <FormattedMessage id="coach.formationDetail.saved" />
          </span>
        )}
      </div>
    </form>
  )
}
