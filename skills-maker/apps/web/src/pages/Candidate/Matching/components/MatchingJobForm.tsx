import type { FormEvent } from 'react'
import { Briefcase, Building2, CheckCircle2, FileText, Link2, Loader2, Sparkles } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type MatchingJobFormProps = {
  jobUrl: string
  onJobUrlChange: (value: string) => void
  jobTitle: string
  onJobTitleChange: (value: string) => void
  company: string
  onCompanyChange: (value: string) => void
  jobDescription: string
  onJobDescriptionChange: (value: string) => void
  isCvLoading: boolean
  hasCv: boolean
  /** False while the CV or the pasted offer would make the server reject the request. */
  canAnalyze: boolean
  isAnalyzing: boolean
  onSubmit: () => void
}

const LABEL_CLASS = 'text-xs font-bold uppercase tracking-wide text-muted-foreground'
// Fields sit straight on the muted page background, so they carry the light surface themselves.
const FIELD_CLASS = 'h-[46px] bg-background pl-10'
const ICON_CLASS = 'pointer-events-none absolute left-3.5 size-4 text-muted-foreground'

export const MatchingJobForm = ({
  jobUrl,
  onJobUrlChange,
  jobTitle,
  onJobTitleChange,
  company,
  onCompanyChange,
  jobDescription,
  onJobDescriptionChange,
  isCvLoading,
  hasCv,
  canAnalyze,
  isAnalyzing,
  onSubmit,
}: MatchingJobFormProps) => {
  const intl = useIntl()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="flex h-full flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="matching-job-url" className={LABEL_CLASS}>
            <FormattedMessage id="candidate.matching.form.jobUrl.label" />
          </Label>
          <div className="relative flex items-center">
            <Link2 className={ICON_CLASS} />
            <Input
              id="matching-job-url"
              value={jobUrl}
              onChange={(event) => onJobUrlChange(event.target.value)}
              placeholder={intl.formatMessage({ id: 'candidate.matching.form.jobUrl.placeholder' })}
              className={FIELD_CLASS}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="matching-job-title" className={LABEL_CLASS}>
            <FormattedMessage id="candidate.matching.form.jobTitle.label" />
          </Label>
          <div className="relative flex items-center">
            <Briefcase className={ICON_CLASS} />
            <Input
              id="matching-job-title"
              value={jobTitle}
              onChange={(event) => onJobTitleChange(event.target.value)}
              placeholder={intl.formatMessage({ id: 'candidate.matching.form.jobTitle.placeholder' })}
              className={FIELD_CLASS}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="matching-company" className={LABEL_CLASS}>
            <FormattedMessage id="candidate.matching.form.company.label" />
          </Label>
          <div className="relative flex items-center">
            <Building2 className={ICON_CLASS} />
            <Input
              id="matching-company"
              value={company}
              onChange={(event) => onCompanyChange(event.target.value)}
              placeholder={intl.formatMessage({ id: 'candidate.matching.form.company.placeholder' })}
              className={FIELD_CLASS}
            />
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <Label htmlFor="matching-job-description" className={LABEL_CLASS}>
          <FormattedMessage id="candidate.matching.form.description.label" />
        </Label>
        {/* Takes the height left over by the fixed rows above. */}
        <div className="relative flex-1">
          <FileText className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-muted-foreground" />
          <Textarea
            id="matching-job-description"
            value={jobDescription}
            onChange={(event) => onJobDescriptionChange(event.target.value)}
            placeholder={intl.formatMessage({ id: 'candidate.matching.form.description.placeholder' })}
            className="field-sizing-fixed h-full min-h-[180px] resize-y bg-background py-3 pr-3.5 pl-10 text-sm shadow-xs"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {/* Section heading, not a field label — nothing to bind a <label> to. */}
        <p className={LABEL_CLASS}>
          <FormattedMessage id="candidate.matching.cv.label" />
        </p>
        {isCvLoading ? (
          <p className="flex items-center gap-2 text-[13.5px] text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            <FormattedMessage id="candidate.matching.cv.loading" />
          </p>
        ) : hasCv ? (
          <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3.5">
            <CheckCircle2 className="size-6 shrink-0 text-success" />
            <div>
              <p className="text-[13.5px] font-bold text-success">
                <FormattedMessage id="candidate.matching.cv.ready.title" />
              </p>
              <p className="mt-0.5 text-[12.5px] text-success">
                <FormattedMessage id="candidate.matching.cv.ready.description" />
              </p>
            </div>
          </div>
        ) : (
          <p className="text-[13.5px] text-muted-foreground">
            <FormattedMessage id="candidate.matching.cv.missing" />
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Button
          type="submit"
          size="lg"
          disabled={isAnalyzing || !canAnalyze}
          className="w-full text-[14.5px]"
        >
          {isAnalyzing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          <FormattedMessage
            id={isAnalyzing ? 'candidate.matching.submit.loading' : 'candidate.matching.submit'}
          />
        </Button>
        {/* A disabled button with no explanation reads as a bug. */}
        {hasCv && !canAnalyze && (
          <p className="text-center text-[12.5px] text-muted-foreground">
            <FormattedMessage id="candidate.matching.submit.hint" />
          </p>
        )}
      </div>
    </form>
  )
}
