import { Sparkles } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Badge } from '@/components/ui/badge'
import { MatchResult } from './components/MatchResult'
import { MatchingJobForm } from './components/MatchingJobForm'
import { useMatching } from './useMatching'

export const Matching = () => {
  const matching = useMatching()

  return (
    <div className="flex min-h-full flex-col gap-6">
      <PageHeader
        titleId="candidate.matching.title"
        descriptionId="candidate.matching.subtitle"
        actions={
          <Badge
            variant="secondary"
            className="h-[34px] gap-1.5 border-primary/15 bg-primary/10 px-3.5 text-[12.5px] font-bold text-primary"
          >
            <Sparkles className="size-3.5" />
            <FormattedMessage id="candidate.matching.badge" />
          </Badge>
        }
      />

      <div className="grid flex-1 grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
        <MatchingJobForm
          jobUrl={matching.jobUrl}
          onJobUrlChange={matching.setJobUrl}
          jobTitle={matching.jobTitle}
          onJobTitleChange={matching.setJobTitle}
          company={matching.company}
          onCompanyChange={matching.setCompany}
          jobDescription={matching.jobDescription}
          onJobDescriptionChange={matching.setJobDescription}
          isCvLoading={matching.isCvLoading}
          hasCv={matching.hasCv}
          canAnalyze={matching.canAnalyze}
          isAnalyzing={matching.isAnalyzing}
          onSubmit={() => void matching.analyze()}
        />

        <div className="flex items-center justify-center" aria-live="polite">
          <MatchResult
            isAnalyzing={matching.isAnalyzing}
            result={matching.result}
            errorMessageId={matching.errorMessageId}
            onFillSample={matching.fillSample}
          />
        </div>
      </div>
    </div>
  )
}
