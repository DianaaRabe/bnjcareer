import type { FormEvent } from 'react'
import { Plus, TriangleAlert } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { MyTrainingQuery } from '@/gql/graphql'
import { ModuleRow } from './ModuleRow'
import { useCurriculumEditor } from '../useCurriculumEditor'

type CurriculumEditorProps = {
  trainingId: string
  curriculum: NonNullable<MyTrainingQuery['myTraining']>['curriculum']
}

export const CurriculumEditor = ({ trainingId, curriculum }: CurriculumEditorProps) => {
  const intl = useIntl()
  const editor = useCurriculumEditor(trainingId)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    editor.addNewModule()
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[15px] font-semibold">
        <FormattedMessage id="coach.formationDetail.curriculum.title" />
      </h2>

      {curriculum.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          <FormattedMessage id="coach.formationDetail.curriculum.empty" />
        </p>
      ) : (
        <ul className="flex flex-col">
          {curriculum.map((module) => (
            <ModuleRow key={module.id} module={module} onRename={editor.renameModule} onDelete={editor.deleteModule} />
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-border pt-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={editor.newModule.title}
            onChange={(event) => editor.setNewModule((current) => ({ ...current, title: event.target.value }))}
            placeholder={intl.formatMessage({ id: 'coach.formationDetail.curriculum.field.title' })}
            className="flex-1"
          />
          <Input
            value={editor.newModule.summary}
            onChange={(event) => editor.setNewModule((current) => ({ ...current, summary: event.target.value }))}
            placeholder={intl.formatMessage({ id: 'coach.formationDetail.curriculum.field.summary' })}
            className="flex-1"
          />
          <Input
            type="number"
            min={1}
            value={editor.newModule.durationMinutes}
            onChange={(event) =>
              editor.setNewModule((current) => ({ ...current, durationMinutes: event.target.value }))
            }
            placeholder={intl.formatMessage({ id: 'coach.formationDetail.curriculum.field.duration' })}
            className="sm:w-28"
          />
        </div>

        {editor.errorMessageId && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3">
            <TriangleAlert className="mt-0.5 size-4 flex-none text-destructive" />
            <p className="text-[13px] text-destructive">
              <FormattedMessage id={editor.errorMessageId} />
            </p>
          </div>
        )}

        <Button type="submit" variant="outline" size="lg" className="w-fit gap-2" disabled={!editor.canAdd}>
          <Plus className="size-4" />
          <FormattedMessage id="coach.formationDetail.curriculum.add" />
        </Button>
      </form>
    </div>
  )
}
