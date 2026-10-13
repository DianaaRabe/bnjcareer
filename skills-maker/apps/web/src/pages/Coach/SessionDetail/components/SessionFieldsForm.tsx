import type { FormEvent } from 'react'
import { Loader2, Save, TriangleAlert } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EVENT_TYPE_LABEL_IDS } from '../../constants'
import { TYPE_ORDER } from '../../Sessions/constants'
import type { useSessionDetail } from '../useSessionDetail'

type SessionFieldsFormProps = {
  detail: ReturnType<typeof useSessionDetail>
}

export const SessionFieldsForm = ({ detail }: SessionFieldsFormProps) => {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    detail.save()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="session-title">
          <FormattedMessage id="coach.sessionDetail.field.title" />
        </Label>
        <Input
          id="session-title"
          value={detail.title}
          onChange={(event) => detail.setTitle(event.target.value)}
          disabled={detail.isSaving}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>
          <FormattedMessage id="coach.sessionDetail.field.type" />
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
                  <FormattedMessage id={EVENT_TYPE_LABEL_IDS[value]} />
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="session-start">
            <FormattedMessage id="coach.sessionDetail.field.startAt" />
          </Label>
          <Input
            id="session-start"
            type="datetime-local"
            value={detail.startAt}
            onChange={(event) => detail.setStartAt(event.target.value)}
            disabled={detail.isSaving}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="session-duration">
            <FormattedMessage id="coach.sessionDetail.field.durationMinutes" />
          </Label>
          <Input
            id="session-duration"
            type="number"
            min={1}
            value={detail.durationMinutes}
            onChange={(event) => detail.setDurationMinutes(Number(event.target.value))}
            disabled={detail.isSaving}
          />
        </div>
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
          <FormattedMessage id="coach.sessionDetail.save" />
        </Button>
        {detail.justSaved && !detail.isSaving && (
          <span className="text-[12.5px] font-semibold text-success">
            <FormattedMessage id="coach.sessionDetail.saved" />
          </span>
        )}
      </div>
    </form>
  )
}
