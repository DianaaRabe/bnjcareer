import { AlertTriangle, ArrowRight, CheckCircle2, Sparkles, Target } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Button } from '@/components/ui/button'
import type { JobMatchResult } from '@/gql/graphql'
import { scoreLevelId } from '../constants'
import { MatchInsightList } from './MatchInsightList'

type MatchResultProps = {
  isAnalyzing: boolean
  result: JobMatchResult | null
  errorMessageId: string | null
  onFillSample: () => void
}

export const MatchResult = ({ isAnalyzing, result, errorMessageId, onFillSample }: MatchResultProps) => {
  if (isAnalyzing) {
    return (
      <div className="flex w-full max-w-[280px] flex-col items-center gap-3">
        <div className="size-16 animate-pulse rounded-2xl bg-primary/10" />
        <div className="h-4 w-40 animate-pulse rounded-full bg-border" />
        <div className="h-3 w-56 animate-pulse rounded-full bg-border" />
        <div className="h-3 w-48 animate-pulse rounded-full bg-border" />
      </div>
    )
  }

  if (errorMessageId) {
    return (
      <div className="flex max-w-[340px] flex-col items-center gap-1.5 text-center">
        <div className="mb-2.5 flex size-[68px] items-center justify-center rounded-[20px] bg-destructive/10">
          <AlertTriangle className="size-[30px] text-destructive" strokeWidth={1.75} />
        </div>
        <h2 className="text-lg font-bold">
          <FormattedMessage id="candidate.matching.error.title" />
        </h2>
        <p className="mt-1 text-[13.5px] leading-snug text-muted-foreground">
          <FormattedMessage id={errorMessageId} />
        </p>
      </div>
    )
  }

  if (result) {
    return (
      <div className="flex w-full max-w-[380px] flex-col items-center gap-4 text-center">
        <div className="flex size-24 items-center justify-center rounded-full bg-primary/10">
          <span className="text-3xl font-bold text-primary">
            <FormattedMessage id="common.format.percent" values={{ value: result.score }} />
          </span>
        </div>
        <div>
          <h2 className="text-lg font-bold">
            <FormattedMessage id={scoreLevelId(result.score)} />
          </h2>
          {result.summary && <p className="mt-1 text-sm text-muted-foreground">{result.summary}</p>}
        </div>

        <MatchInsightList
          titleId="candidate.matching.result.strengths.title"
          items={result.strengths}
          icon={CheckCircle2}
          iconClassName="text-success"
        />
        <MatchInsightList
          titleId="candidate.matching.result.gaps.title"
          items={result.gaps}
          icon={AlertTriangle}
          iconClassName="text-warning"
        />
        <MatchInsightList
          titleId="candidate.matching.result.tips.title"
          items={result.tips}
          icon={Sparkles}
          iconClassName="text-primary"
        />
      </div>
    )
  }

  return (
    <div className="flex max-w-[340px] flex-col items-center gap-1.5 text-center">
      <div className="mb-2.5 flex size-[68px] items-center justify-center rounded-[20px] bg-primary/10">
        <Target className="size-[30px] text-primary" strokeWidth={1.75} />
      </div>
      <h2 className="text-lg font-bold">
        <FormattedMessage id="candidate.matching.empty.title" />
      </h2>
      <p className="mt-1 text-[13.5px] leading-snug text-muted-foreground">
        <FormattedMessage id="candidate.matching.empty.description" />
      </p>
      <Button variant="link" onClick={onFillSample} className="mt-2 gap-1 px-0 text-[13px]">
        <FormattedMessage id="candidate.matching.empty.sample" />
        <ArrowRight className="size-3.5" />
      </Button>
    </div>
  )
}
