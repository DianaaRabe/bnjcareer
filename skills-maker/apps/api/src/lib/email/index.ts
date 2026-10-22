// Public surface of the application-email layer (Phase 4). Named exports only, so the
// provider internals and HTTP seams never leak into callers.
export {
  MANDATORY_BCC,
  MIN_CV_BYTES,
  MAX_CV_BYTES,
  MAX_SEND_ATTEMPTS,
  BACKOFF_BASE_MS,
} from './constants.js'

export {
  EmailSendError,
  type EmailAttachment,
  type EmailErrorCode,
  type EmailProviderName,
  type MailProvider,
  type OutgoingEmail,
  type ProviderSendInput,
  type SendResult,
} from './types.js'

export { assertMandatoryBcc, buildProviderInput, type BuildMessageOptions } from './buildMessage.js'
export {
  buildApplicationEmail,
  buildBody,
  buildSubject,
  type ApplicationEmailInput,
} from './buildApplicationEmail.js'
export { buildCvAttachment, verifyCvPdf, type CvVerification } from './cvAttachment.js'
export { createDryRunProvider } from './dryRunProvider.js'
export { createBrevoProvider } from './brevoProvider.js'

export {
  createPrismaEmailStore,
  nullEmailStore,
  type EmailRecord,
  type EmailStore,
} from './store.js'

export {
  liveSendAllowed,
  resolveProvider,
  sendApplicationEmail,
  type SendApplicationDeps,
  type SendApplicationInput,
  type SendApplicationResult,
} from './sender.js'
