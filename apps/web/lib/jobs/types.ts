// ─────────────────────────────────────────────────────────────────────────────
// Job Provider Abstraction
// Defines the contract that all job datasources must implement.
// ─────────────────────────────────────────────────────────────────────────────

export interface JobSearchQuery {
  keywords?:       string
  location?:       string
  limit?:          number
  contractType?:   string[]
  experienceLevel?: string[]
  remote?:         string[]
  /** Provider-specific: period for aggregators (7d, 30d...) */
  period?:         string
}

export interface NormalizedJob {
  id:               string
  source:           'indeed' | 'linkedin' | 'hellowork' | 'local'
  title:            string
  companyName:      string
  companyLogo?:     string | null
  location:         string
  salary?:          string | null
  contractType?:    string | null
  experienceLevel?: string | null
  remote?:          string | null
  sector?:          string | null
  jobUrl:           string
  applyUrl?:        string
  postedDate?:      string | null
  postedTimeAgo?:   string | null
  descriptionText?: string
  descriptionHtml?: string
  applicationsCount?: number | null
  /** Only present for local-db jobs */
  companyId?:       string
  skills?:          string[]
  applicationEmail?: string
}

export interface JobProviderResult {
  items:  NormalizedJob[]
  total?: number
  error?: string
}

/**
 * Unified interface for all job datasources.
 * Any new datasource must implement this contract.
 */
export interface JobProvider {
  /**
   * Search / list jobs with optional filters.
   */
  search(query: JobSearchQuery): Promise<JobProviderResult>

  /**
   * Get a single job by ID.
   */
  getById(id: string): Promise<NormalizedJob | null>
}
