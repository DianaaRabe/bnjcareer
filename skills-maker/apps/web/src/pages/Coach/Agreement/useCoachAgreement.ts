import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { useMeQuery } from '@/graphql/hooks/auth'
import { MY_COACH_AGREEMENT_QUERY } from '@/graphql/queries/coachAgreement'
import {
  useMyCoachAgreementQuery,
  useSignCoachAgreementMutation,
} from '@/graphql/hooks/coachAgreement'
import { getGraphQLErrorCode } from '@/lib/apollo'
import { AGREEMENT_ERROR_MESSAGE_IDS, MIN_SIGNED_NAME_LENGTH } from './constants'

export const useCoachAgreement = () => {
  const navigate = useNavigate()
  const { data: meData } = useMeQuery()
  const { data, loading, error } = useMyCoachAgreementQuery()
  const [sign, { loading: isSigning }] = useSignCoachAgreementMutation()

  const [signedName, setSignedName] = useState('')
  const [confirmsIdentity, setConfirmsIdentity] = useState(false)
  const [acceptsTerms, setAcceptsTerms] = useState(false)
  const [errorMessageId, setErrorMessageId] = useState<string | null>(null)

  const profile = meData?.me?.profile
  const status = data?.myCoachAgreement

  // Prefill with the name on file — the coach can still correct it before signing.
  useEffect(() => {
    const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ')
    if (fullName) setSignedName((current) => current || fullName)
  }, [profile?.firstName, profile?.lastName])

  // Nothing to sign twice: a coach who already accepted goes straight to their space.
  useEffect(() => {
    if (status?.isSigned) navigate(ROUTES.coach.root, { replace: true })
  }, [navigate, status?.isSigned])

  const canSign =
    signedName.trim().length >= MIN_SIGNED_NAME_LENGTH &&
    confirmsIdentity &&
    acceptsTerms &&
    !isSigning

  const submit = async () => {
    if (!canSign || !status) return

    setErrorMessageId(null)

    try {
      await sign({
        variables: {
          input: {
            contractVersion: status.terms.currentVersion,
            signedName: signedName.trim(),
          },
        },
        // The gate reads this query cache-first: leaving it stale bounces the coach back here.
        refetchQueries: [{ query: MY_COACH_AGREEMENT_QUERY }],
        awaitRefetchQueries: true,
      })
      navigate(ROUTES.coach.root, { replace: true })
    } catch (err) {
      const code = getGraphQLErrorCode(err)
      setErrorMessageId(
        AGREEMENT_ERROR_MESSAGE_IDS[String(code)] ?? AGREEMENT_ERROR_MESSAGE_IDS.default,
      )
    }
  }

  return {
    terms: status?.terms ?? null,
    email: meData?.me?.email ?? '',
    signedName,
    setSignedName,
    confirmsIdentity,
    setConfirmsIdentity,
    acceptsTerms,
    setAcceptsTerms,
    canSign,
    isSigning,
    isLoading: loading,
    hasError: Boolean(error),
    errorMessageId,
    submit: () => void submit(),
  }
}
