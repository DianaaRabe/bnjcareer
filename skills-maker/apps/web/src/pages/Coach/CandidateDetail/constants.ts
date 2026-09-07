import { ApplicationStatus, CvStatus } from '@/gql/graphql'

/** Server error codes → message ids. The API returns English strings, never rendered as-is. */
export const CANDIDATE_ERROR_MESSAGE_IDS: Record<string, string> = {
  CANDIDATE_NOT_FOUND: 'coach.candidateDetail.error.notFound',
  default: 'coach.candidateDetail.error.unexpected',
}

export const APPLICATION_STATUS_LABEL_IDS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.Sent]: 'coach.candidateDetail.applications.status.sent',
  [ApplicationStatus.Pending]: 'coach.candidateDetail.applications.status.pending',
  [ApplicationStatus.Interview]: 'coach.candidateDetail.applications.status.interview',
  [ApplicationStatus.Rejected]: 'coach.candidateDetail.applications.status.rejected',
}

export const APPLICATION_STATUS_STYLES: Record<ApplicationStatus, string> = {
  [ApplicationStatus.Sent]: 'bg-muted text-muted-foreground',
  [ApplicationStatus.Pending]: 'bg-warning/10 text-warning',
  [ApplicationStatus.Interview]: 'bg-success/10 text-success',
  [ApplicationStatus.Rejected]: 'bg-destructive/10 text-destructive',
}

export const CV_STATUS_LABEL_IDS: Record<CvStatus, string> = {
  [CvStatus.Uploaded]: 'coach.candidateDetail.cvStatus.uploaded',
  [CvStatus.Extracting]: 'coach.candidateDetail.cvStatus.extracting',
  [CvStatus.Extracted]: 'coach.candidateDetail.cvStatus.extracted',
  [CvStatus.ExtractionFailed]: 'coach.candidateDetail.cvStatus.extractionFailed',
  [CvStatus.Optimizing]: 'coach.candidateDetail.cvStatus.optimizing',
  [CvStatus.Optimized]: 'coach.candidateDetail.cvStatus.optimized',
  [CvStatus.OptimizationFailed]: 'coach.candidateDetail.cvStatus.optimizationFailed',
}
