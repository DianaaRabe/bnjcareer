// Centralized user-facing strings (English). Swap for full i18n if FR/EN ever becomes required.
export const messages = {
  invalidCredentialsFormat: 'Invalid email or password',
  emailAlreadyExists: 'An account already exists with this email',
  incorrectCredentials: 'Incorrect email or password',
  authenticationRequired: 'Authentication required',
  accessDenied: 'Access denied',
  invalidProfileInput: 'Invalid profile data',
  cvNotFound: 'CV not found',
  cvUploadInvalid: 'Invalid CV upload data',
  cvExtractionFailed: 'Failed to extract CV content',
  cvOptimizationRequiresExtraction: 'The CV must be extracted before it can be optimized',
  cvOptimizationFailed: 'Failed to optimize CV',
  invalidJobSearchInput: 'Invalid job search criteria',
  jobSourceNotConfigured: 'This job source is not available',
  jobSearchFailed: 'Unable to fetch job offers right now',
} as const
