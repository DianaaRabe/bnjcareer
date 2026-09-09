import type { FormEvent } from 'react'
import { useState } from 'react'
import { Loader2, Plus, TriangleAlert } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ROUTES } from '@/constants/routes'
import { EVENT_TYPE_LABEL_IDS } from '../../constants'
import { TYPE_ORDER } from '../constants'
import { useCreateSession } from '../useCreateSession'

export const CreateSessionDialog = () => {
  const intl = useIntl()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const form = useCreateSession((id) => {
    setOpen(false)
    navigate(`${ROUTES.coach.sessions}/${id}`)
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    form.submit()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) form.reset()
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 rounded-xl">
          <Plus className="size-4" />
          <FormattedMessage id="coach.sessions.create.trigger" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>
              <FormattedMessage id="coach.sessions.create.title" />
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="session-title">
              <FormattedMessage id="coach.sessions.create.field.title" />
            </Label>
            <Input
              id="session-title"
              value={form.title}
              onChange={(event) => form.setTitle(event.target.value)}
              disabled={form.isCreating}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              <FormattedMessage id="coach.sessions.create.field.type" />
            </Label>
            <Select
              value={form.type}
              onValueChange={(value) => form.setType(value as typeof form.type)}
              disabled={form.isCreating}
            >
              <SelectTrigger>
                <SelectValue placeholder={intl.formatMessage({ id: 'coach.sessions.create.field.select' })} />
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
                <FormattedMessage id="coach.sessions.create.field.startAt" />
              </Label>
              <Input
                id="session-start"
                type="datetime-local"
                value={form.startAt}
                onChange={(event) => form.setStartAt(event.target.value)}
                disabled={form.isCreating}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="session-duration">
                <FormattedMessage id="coach.sessions.create.field.durationMinutes" />
              </Label>
              <Input
                id="session-duration"
                type="number"
                min={1}
                value={form.durationMinutes}
                onChange={(event) => form.setDurationMinutes(Number(event.target.value))}
                disabled={form.isCreating}
              />
            </div>
          </div>

          {form.errorMessageId && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3"
            >
              <TriangleAlert className="mt-0.5 size-4 flex-none text-destructive" />
              <p className="text-[13px] text-destructive">
                <FormattedMessage id={form.errorMessageId} />
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" size="lg" className="gap-2" disabled={!form.canSubmit}>
              {form.isCreating && <Loader2 className="size-4 animate-spin" />}
              <FormattedMessage id="coach.sessions.create.submit" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
