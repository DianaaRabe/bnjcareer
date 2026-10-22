import type { FormEvent } from 'react'
import { Loader2, Save, TriangleAlert } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  ACCESS_LABEL_IDS,
  ACCESS_ORDER,
  CATEGORY_LABEL_IDS,
  CATEGORY_ORDER,
  TYPE_LABEL_IDS,
  TYPE_ORDER,
} from '@/constants/resources'
import { ResourceAccess } from '@/gql/graphql'
import type { useResourceDetail } from '../useResourceDetail'

type ResourceFieldsFormProps = {
  detail: ReturnType<typeof useResourceDetail>
}

export const ResourceFieldsForm = ({ detail }: ResourceFieldsFormProps) => {
  const intl = useIntl()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    detail.save()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4 rounded-xl bg-muted p-3.5">
        <div>
          <p className="text-[13.5px] font-semibold">
            <FormattedMessage
              id={detail.resource?.published ? 'coach.resourceDetail.published' : 'coach.resourceDetail.draft'}
            />
          </p>
          <p className="text-[12px] text-muted-foreground">
            <FormattedMessage id="coach.resourceDetail.publishedHint" />
          </p>
        </div>
        <Switch checked={detail.resource?.published ?? false} onCheckedChange={detail.togglePublished} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="resource-title">
          <FormattedMessage id="coach.resourceDetail.field.title" />
        </Label>
        <Input
          id="resource-title"
          value={detail.title}
          onChange={(event) => detail.setTitle(event.target.value)}
          disabled={detail.isSaving}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="resource-description">
          <FormattedMessage id="coach.resourceDetail.field.description" />
        </Label>
        <Textarea
          id="resource-description"
          value={detail.description}
          onChange={(event) => detail.setDescription(event.target.value)}
          disabled={detail.isSaving}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>
            <FormattedMessage id="coach.resourceDetail.field.type" />
          </Label>
          <Select
            value={detail.type}
            onValueChange={(value) => detail.setType(value as typeof detail.type)}
            disabled={detail.isSaving}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {TYPE_ORDER.map((value) => (
                  <SelectItem key={value} value={value}>
                    <FormattedMessage id={TYPE_LABEL_IDS[value]} />
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>
            <FormattedMessage id="coach.resourceDetail.field.category" />
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
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="resource-url">
          <FormattedMessage id="coach.resourceDetail.field.url" />
        </Label>
        <Input
          id="resource-url"
          value={detail.url}
          onChange={(event) => detail.setUrl(event.target.value)}
          placeholder="https://…"
          disabled={detail.isSaving}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="resource-size">
            <FormattedMessage id="coach.resourceDetail.field.sizeBytes" />
          </Label>
          <Input
            id="resource-size"
            type="number"
            min={0}
            value={detail.sizeBytes}
            onChange={(event) => detail.setSizeBytes(event.target.value)}
            disabled={detail.isSaving}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="resource-duration">
            <FormattedMessage id="coach.resourceDetail.field.durationMinutes" />
          </Label>
          <Input
            id="resource-duration"
            type="number"
            min={0}
            value={detail.durationMinutes}
            onChange={(event) => detail.setDurationMinutes(event.target.value)}
            disabled={detail.isSaving}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>
            <FormattedMessage id="coach.resourceDetail.field.access" />
          </Label>
          <Select
            value={detail.access}
            onValueChange={(value) => detail.setAccess(value as typeof detail.access)}
            disabled={detail.isSaving}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {ACCESS_ORDER.map((value) => (
                  <SelectItem key={value} value={value}>
                    <FormattedMessage id={ACCESS_LABEL_IDS[value]} />
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {detail.access === ResourceAccess.Paid && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="resource-price">
              <FormattedMessage id="coach.resourceDetail.field.priceCents" />
            </Label>
            <Input
              id="resource-price"
              type="number"
              min={0}
              placeholder={intl.formatMessage({ id: 'coach.resourceDetail.field.priceFree' })}
              value={detail.priceCents}
              onChange={(event) => detail.setPriceCents(event.target.value)}
              disabled={detail.isSaving}
            />
          </div>
        )}
      </div>

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
          <FormattedMessage id="coach.resourceDetail.save" />
        </Button>
        {detail.justSaved && !detail.isSaving && (
          <span className="text-[12.5px] font-semibold text-success">
            <FormattedMessage id="coach.resourceDetail.saved" />
          </span>
        )}
      </div>
    </form>
  )
}
