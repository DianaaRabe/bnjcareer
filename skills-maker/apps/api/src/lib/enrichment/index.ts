// Public surface of the enrichment module. Exported name by name rather than with
// `export *` because each provider keeps its own `__testing` seam.
export * from './types.js'

export {
  emailDomain,
  findEmailInText,
  isApplicationEmail,
  normaliseObfuscation,
  rankApplicationEmails,
  scoreApplicationEmail,
} from './emailAddresses.js'

export {
  canReceiveMail,
  candidateDomains,
  companyKeywords,
  domainOf,
  MAX_CANDIDATE_DOMAINS,
  slugWords,
  textMentionsCompany,
} from './companyDomains.js'

export { delay, mapBounded } from './concurrency.js'
export { assertPublicUrl, isBlockedAddress, safeFetchText, UnsafeUrlError } from './safeFetch.js'
export { discoverCompanyWebsite, scanSiteForEmails, siteEnricher } from './siteEnricher.js'
export {
  isLushaConfigured,
  LushaError,
  lushaEnrichContacts,
  lushaProspectContacts,
  lushaSearchContacts,
  type LushaErrorCode,
  type LushaContactPreview,
  type LushaEnrichedContact,
} from './lushaClient.js'
export { lushaEnricher, resetLushaCaches } from './lushaEnricher.js'
export {
  DEFAULT_ENRICHERS,
  resolveContactEmail,
  resolveJobContact,
  type ContactFailure,
  type ContactResolution,
} from './resolveContact.js'
