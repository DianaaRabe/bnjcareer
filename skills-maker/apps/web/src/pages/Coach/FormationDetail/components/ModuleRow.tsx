import { useState } from 'react'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { MyTrainingQuery } from '@/gql/graphql'
import type { ModuleInput } from '../useCurriculumEditor'

type Module = NonNullable<MyTrainingQuery['myTraining']>['curriculum'][number]

type ModuleRowProps = {
  module: Module
  onRename: (id: string, input: ModuleInput) => void
  onDelete: (id: string) => void
}

const toModuleInput = (module: Module): ModuleInput => ({
  title: module.title,
  summary: module.summary ?? '',
  durationMinutes: module.durationMinutes != null ? String(module.durationMinutes) : '',
})

export const ModuleRow = ({ module, onRename, onDelete }: ModuleRowProps) => {
  const intl = useIntl()
  const [isEditing, setIsEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [draft, setDraft] = useState<ModuleInput>(() => toModuleInput(module))

  const startEditing = () => {
    setDraft(toModuleInput(module))
    setIsEditing(true)
  }

  const confirmRename = () => {
    if (!draft.title.trim()) return
    onRename(module.id, draft)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <li className="flex flex-col gap-2 border-b border-border py-3 last:border-b-0">
        <Input
          value={draft.title}
          onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
          placeholder={intl.formatMessage({ id: 'coach.formationDetail.curriculum.field.title' })}
          autoFocus
        />
        <div className="flex gap-2">
          <Input
            value={draft.summary}
            onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))}
            placeholder={intl.formatMessage({ id: 'coach.formationDetail.curriculum.field.summary' })}
            className="flex-1"
          />
          <Input
            type="number"
            min={1}
            value={draft.durationMinutes}
            onChange={(event) => setDraft((current) => ({ ...current, durationMinutes: event.target.value }))}
            placeholder={intl.formatMessage({ id: 'coach.formationDetail.curriculum.field.duration' })}
            className="w-28"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => setIsEditing(false)}>
            <X className="size-3.5" />
            <FormattedMessage id="common.cancel" />
          </Button>
          <Button type="button" size="sm" className="gap-1" onClick={confirmRename} disabled={!draft.title.trim()}>
            <Check className="size-3.5" />
            <FormattedMessage id="common.save" />
          </Button>
        </div>
      </li>
    )
  }

  return (
    <li className="flex items-center gap-3 border-b border-border py-3 last:border-b-0">
      <span className="flex size-7 flex-none items-center justify-center rounded-full bg-muted text-[12px] font-bold text-muted-foreground">
        {module.position}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold">{module.title}</p>
        {module.summary && <p className="truncate text-[12.5px] text-muted-foreground">{module.summary}</p>}
      </div>

      {module.durationMinutes != null && (
        <span className="flex-none text-[12px] text-muted-foreground">
          <FormattedMessage
            id="coach.formationDetail.curriculum.minutes"
            values={{ count: module.durationMinutes }}
          />
        </span>
      )}

      <div className="flex flex-none items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          onClick={startEditing}
          aria-label={intl.formatMessage({ id: 'coach.formationDetail.curriculum.edit' })}
        >
          <Pencil className="size-3.5" />
        </Button>

        {confirmingDelete ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-destructive/40 text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(module.id)}
            onBlur={() => setConfirmingDelete(false)}
            autoFocus
          >
            <FormattedMessage id="coach.formationDetail.curriculum.confirmRemove" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setConfirmingDelete(true)}
            aria-label={intl.formatMessage({ id: 'coach.formationDetail.curriculum.remove' })}
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </div>
    </li>
  )
}
