import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  useCancelPreparedApplicationMutation,
  useMyAutomationRunsQuery,
  useMyAutomationSettingsQuery,
  useMyPreparedApplicationsQuery,
  useSetAutomationEnabledMutation,
  useUpdateAutomationSettingsMutation,
} from '@/graphql/hooks/automation'
import { useSendApplicationMutation } from '@/graphql/hooks/applications'
import { AutomationFrequency, type UpdateAutomationSettingsInput } from '@/gql/graphql'
import { useTranslate } from '@/hooks/useTranslate'
import { getGraphQLErrorCode } from '@/lib/apollo'
import {
  MY_AUTOMATION_SETTINGS_QUERY,
  MY_PREPARED_APPLICATIONS_QUERY,
} from '@/graphql/queries/automation'

const AUTOSAVE_DELAY_MS = 900

/** Local, editable mirror of the server's automation preferences. */
type Draft = {
  frequency: AutomationFrequency
  maxApplicationsPerRun: number
  maxApplicationsPerDay: number
  minMatchScore: number
  approvalMode: boolean
  keywords: string[]
  locations: string[]
  contractTypes: string[]
}

/**
 * Drives the automation control center (settings, runs, prepared-application review). Extracted
 * from the page so the applications hub can mount it as one tab among others.
 */
export const useAutomationPanel = () => {
  const { translate } = useTranslate()

  const settingsQuery = useMyAutomationSettingsQuery()
  const preparedQuery = useMyPreparedApplicationsQuery()
  const runsQuery = useMyAutomationRunsQuery({ variables: { limit: 5 } })

  const [updateSettings, { loading: savingPrefs }] = useUpdateAutomationSettingsMutation()
  const [setEnabled, { loading: togglingEnabled }] = useSetAutomationEnabledMutation()
  const [cancelPrepared] = useCancelPreparedApplicationMutation()
  const [sendApplication] = useSendApplicationMutation()
  // The id currently being sent — drives the per-card spinner without blocking the others.
  const [sendingId, setSendingId] = useState<string | null>(null)

  const settings = settingsQuery.data?.myAutomationSettings
  const [draft, setDraft] = useState<Draft | null>(null)
  const hydrated = useRef(false)

  // Hydrate the editable draft once from the server, then let the autosave effect own it.
  useEffect(() => {
    if (!settings || hydrated.current) return
    hydrated.current = true
    setDraft({
      frequency: settings.frequency,
      maxApplicationsPerRun: settings.maxApplicationsPerRun,
      maxApplicationsPerDay: settings.maxApplicationsPerDay,
      minMatchScore: settings.minMatchScore,
      approvalMode: settings.approvalMode,
      keywords: settings.keywords,
      locations: settings.locations,
      contractTypes: settings.contractTypes,
    })
  }, [settings])

  // Debounced autosave of preferences. Enabling is deliberately NOT part of this —
  // saving preferences can never turn automation on (skill §25).
  const skipNextSave = useRef(true)
  useEffect(() => {
    if (!draft) return
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }

    const input: UpdateAutomationSettingsInput = {
      frequency: draft.frequency,
      maxApplicationsPerRun: draft.maxApplicationsPerRun,
      maxApplicationsPerDay: draft.maxApplicationsPerDay,
      minMatchScore: draft.minMatchScore,
      approvalMode: draft.approvalMode,
      keywords: draft.keywords,
      locations: draft.locations,
      contractTypes: draft.contractTypes,
    }

    const timer = setTimeout(async () => {
      try {
        await updateSettings({ variables: { input } })
      } catch (err) {
        const code = getGraphQLErrorCode(err)
        toast.error(translate('candidate.applications.save.error'), {
          description: translate(
            code === 'BAD_USER_INPUT'
              ? 'candidate.applications.save.invalid'
              : 'candidate.applications.save.unexpected',
          ),
        })
      }
    }, AUTOSAVE_DELAY_MS)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  const patch = (changes: Partial<Draft>) => setDraft((prev) => (prev ? { ...prev, ...changes } : prev))

  const toggleEnabled = async (next: boolean) => {
    try {
      await setEnabled({
        variables: { enabled: next },
        refetchQueries: [MY_AUTOMATION_SETTINGS_QUERY],
      })
      toast.success(
        translate(next ? 'candidate.applications.toggle.on' : 'candidate.applications.toggle.off'),
      )
    } catch {
      toast.error(translate('candidate.applications.toggle.error'))
    }
  }

  const cancelApplication = async (id: string) => {
    try {
      await cancelPrepared({
        variables: { id },
        refetchQueries: [MY_PREPARED_APPLICATIONS_QUERY],
      })
      toast.success(translate('candidate.applications.review.cancelled'))
    } catch {
      toast.error(translate('candidate.applications.review.cancelError'))
    }
  }

  // The candidate's explicit decision to send a reviewed application. Once sent, the application
  // leaves READY_TO_SEND, so it drops out of the review queue — refetch to make the card disappear.
  // Failures map to an honest message by error code, matching the main applications hub.
  const sendApplication_ = async (id: string) => {
    setSendingId(id)
    try {
      await sendApplication({
        variables: { id },
        refetchQueries: [MY_PREPARED_APPLICATIONS_QUERY],
      })
      toast.success(translate('candidate.applications.send.success'))
    } catch (err) {
      const code = getGraphQLErrorCode(err)
      const descriptionId =
        code === 'FORBIDDEN'
          ? 'candidate.applications.send.disabled'
          : code === 'FAILED_PRECONDITION'
            ? 'candidate.applications.send.notReady'
            : 'candidate.applications.send.unexpected'
      toast.error(translate('candidate.applications.send.error'), {
        description: translate(descriptionId),
      })
    } finally {
      setSendingId(null)
    }
  }

  return {
    isLoading: settingsQuery.loading && !settings,
    hasError: Boolean(settingsQuery.error),
    retry: () => settingsQuery.refetch(),

    enabled: settings?.enabled ?? false,
    nextRunAt: settings?.nextRunAt ?? null,
    ceilings: settings?.ceilings ?? null,
    defaults: settings?.defaults ?? null,
    togglingEnabled,
    toggleEnabled,

    draft,
    patch,
    savingPrefs,

    prepared: preparedQuery.data?.myPreparedApplications ?? [],
    preparedLoading: preparedQuery.loading && !preparedQuery.data,
    cancelApplication,
    sendApplication: sendApplication_,
    sendingId,

    runs: runsQuery.data?.myAutomationRuns ?? [],
  }
}
