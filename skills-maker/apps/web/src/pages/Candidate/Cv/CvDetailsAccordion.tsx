import { Pencil } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type CvDetailsAccordionProps = {
  name: string
  onNameChange: (value: string) => void
  title: string
  onTitleChange: (value: string) => void
  summary: string
  onSummaryChange: (value: string) => void
  onSave: () => void
}

export const CvDetailsAccordion = ({
  name,
  onNameChange,
  title,
  onTitleChange,
  summary,
  onSummaryChange,
  onSave,
}: CvDetailsAccordionProps) => {
  return (
    <Accordion type="single" collapsible className="rounded-lg border bg-card shadow-xs">
      <AccordionItem value="details" className="border-none">
        <AccordionTrigger className="gap-4 px-4 hover:no-underline">
          <div className="flex items-center gap-3.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
              <Pencil className="size-[18px]" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                <FormattedMessage id="candidate.cv.details.toggle.title" />
              </p>
              <p className="text-xs font-normal text-muted-foreground">
                <FormattedMessage id="candidate.cv.details.toggle.description" />
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-5">
          <div className="flex flex-col gap-3.5 border-t pt-3.5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cv-details-name">
                <FormattedMessage id="candidate.cv.details.name.label" />
              </Label>
              <Input id="cv-details-name" value={name} onChange={(e) => onNameChange(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cv-details-title">
                <FormattedMessage id="candidate.cv.details.professionalTitle.label" />
              </Label>
              <Input id="cv-details-title" value={title} onChange={(e) => onTitleChange(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cv-details-summary">
                <FormattedMessage id="candidate.cv.details.summary.label" />
              </Label>
              <Textarea
                id="cv-details-summary"
                rows={3}
                value={summary}
                onChange={(e) => onSummaryChange(e.target.value)}
              />
            </div>
            <Button size="sm" onClick={onSave} className="self-start">
              <FormattedMessage id="candidate.cv.details.save" />
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
