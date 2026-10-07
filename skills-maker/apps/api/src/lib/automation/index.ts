// Public surface of the automation engine. Named exports rather than `export *` so the
// `__testing` seams of the underlying modules do not leak into the module's API.
export * from './types.js'

export {
  AUTOMATION_CEILINGS,
  AUTOMATION_DEFAULTS,
  AUTOMATION_INTERVAL_MS,
  nextRunAt,
  resolveAutomationSettings,
  RUN_STALE_AFTER_MS,
  type AutomationSettingsResolved,
  type AutomationSettingsRow,
} from './constants.js'

export {
  evaluateJobEligibility,
  isValidRecipient,
  matchesContractTypes,
  matchesKeywords,
  matchesLocations,
  remainingBudget,
  type BudgetCounts,
  type EligibilityVerdict,
} from './eligibility.js'

export {
  buildCoverLetterMessages,
  generateCoverLetter,
  MAX_COVER_LETTER_LENGTH,
  MIN_COVER_LETTER_LENGTH,
  parseCoverLetter,
  type CoverLetterContext,
  type LetterLanguage,
  type LlmCaller,
} from './coverLetter.js'

export {
  buildSearchQuery,
  runApplicationPipeline,
  runAutomationForCandidate,
  startOfDayUtc,
  type CandidateRunContext,
  type CvContext,
  type EngineDependencies,
  type RunAutomationOptions,
  type RunEngineInput,
} from './engine.js'

export {
  createPrismaSchedulerStore,
  createSchedulerDeps,
  runDueAutomations,
  statsFromOutcome,
  type CandidateDisposition,
  type CandidateResult,
  type ClaimedRun,
  type CompleteRunInput,
  type RunStats,
  type SchedulerDeps,
  type SchedulerStore,
  type SchedulerSummary,
} from './scheduler.js'

export {
  createPrismaAutomationStore,
  nullAutomationStore,
  type AppliedRecord,
  type AutomationStore,
  type SavePreparedInput,
  type SavePreparedResult,
} from './store.js'
