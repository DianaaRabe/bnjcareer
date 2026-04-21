// ─── Shared Onboarding Types ────────────────────────────────────────────────

export type UserRole = 'candidate' | 'coach'

export type CurrentStatus = 'student' | 'job_seeker' | 'reconversion'
export type MainGoal = 'find_job' | 'improve_cv' | 'change_career' | 'learn_skills' | 'network'
export type EducationLevel =
  | 'no_diploma'
  | 'bac'
  | 'bac+2'
  | 'bac+3'
  | 'bac+5'
  | 'phd'
  | 'other'

export type SessionType = '1v1' | 'group'

// ─── Candidate Form State ────────────────────────────────────────────────────

export interface CandidateOnboardingData {
  // Step 1 – Basic Info
  first_name: string
  last_name: string
  birth_date: string         // ISO date string YYYY-MM-DD
  phone: string

  // Step 2 – Education & Career
  education_level: EducationLevel | ''
  industry: string
  current_status: CurrentStatus | ''

  // Step 3 – Skills & Self-assessment
  strengths: string[]        // max 3
  weaknesses: string[]       // max 3
  skills: string[]           // free tags

  // Step 4 – Goals
  main_goal: MainGoal | ''

  // Step 5 – Profile
  avatar_url: string
  bio: string
}

export const defaultCandidateData: CandidateOnboardingData = {
  first_name: '',
  last_name: '',
  birth_date: '',
  phone: '',
  education_level: '',
  industry: '',
  current_status: '',
  strengths: [],
  weaknesses: [],
  skills: [],
  main_goal: '',
  avatar_url: '',
  bio: '',
}

// ─── Coach Form State ────────────────────────────────────────────────────────

export interface PreviousRole {
  title: string
  company: string
}

export interface CoachOnboardingData {
  // Step 1 – Identity
  first_name: string
  last_name: string
  avatar_url: string

  // Step 2 – Expertise
  specialization: string
  experience_years: number | ''
  certifications: string[]

  // Step 3 – Professional Info
  previous_roles: PreviousRole[]
  bio: string

  // Step 4 – Coaching Setup
  session_types: SessionType[]
  support_areas: string[]
}

export const defaultCoachData: CoachOnboardingData = {
  first_name: '',
  last_name: '',
  avatar_url: '',
  specialization: '',
  experience_years: '',
  certifications: [],
  previous_roles: [],
  bio: '',
  session_types: [],
  support_areas: [],
}

// ─── API Payload ─────────────────────────────────────────────────────────────

export type OnboardingPayload =
  | ({ role: 'candidate' } & CandidateOnboardingData)
  | ({ role: 'coach' } & CoachOnboardingData)
