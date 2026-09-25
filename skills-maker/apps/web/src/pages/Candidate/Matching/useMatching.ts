import { useState } from 'react'

import type { JobMatchResult } from '@/gql/graphql'
import { useMyCvQuery } from '@/graphql/hooks/cv'
import { useAnalyzeJobMatchMutation } from '@/graphql/hooks/matching'
import { getGraphQLErrorCode } from '@/lib/apollo'
import { ERROR_MESSAGE_IDS, MIN_DESCRIPTION_LENGTH, SAMPLE_JOB } from './constants'

export const useMatching = () => {
  const { data: cvData, loading: isCvLoading } = useMyCvQuery()
  const [analyzeJobMatch, { loading: isAnalyzing }] = useAnalyzeJobMatchMutation()

  const [jobUrl, setJobUrl] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState<JobMatchResult | null>(null)
  const [errorMessageId, setErrorMessageId] = useState<string | null>(null)

  const clearOutcome = () => {
    setResult(null)
    setErrorMessageId(null)
  }

  // A score shown next to a different offer would be read as that offer's score.
  const editDescription = (value: string) => {
    setJobDescription(value)
    clearOutcome()
  }

  const fillSample = () => {
    setJobUrl(SAMPLE_JOB.jobUrl)
    setJobTitle(SAMPLE_JOB.jobTitle)
    setCompany(SAMPLE_JOB.company)
    setJobDescription(SAMPLE_JOB.description)
    clearOutcome()
  }

  // The CV only counts once the extraction succeeded — that is what the server requires.
  const hasCv = Boolean(cvData?.myCv?.extractedData)

  const analyze = async () => {
    clearOutcome()

    try {
      const { data } = await analyzeJobMatch({
        variables: {
          input: {
            jobUrl: jobUrl.trim() || null,
            jobTitle: jobTitle.trim() || null,
            company: company.trim() || null,
            description: jobDescription,
          },
        },
      })
      setResult(data?.analyzeJobMatch ?? null)
    } catch (err) {
      const code = getGraphQLErrorCode(err)
      setErrorMessageId(ERROR_MESSAGE_IDS[String(code)] ?? ERROR_MESSAGE_IDS.default)
    }
  }

  return {
    jobUrl,
    setJobUrl,
    jobTitle,
    setJobTitle,
    company,
    setCompany,
    jobDescription,
    setJobDescription: editDescription,
    isCvLoading,
    hasCv,
    canAnalyze: hasCv && jobDescription.trim().length >= MIN_DESCRIPTION_LENGTH,
    isAnalyzing,
    result,
    errorMessageId,
    analyze,
    fillSample,
  }
}
