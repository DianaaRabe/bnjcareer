import {
  Briefcase,
  BookOpen,
  FileText,
  GraduationCap,
  Handshake,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  User,
  type LucideIcon,
} from 'lucide-react'

import { ProfileObjective, ProfileSituation } from '@/gql/graphql'

export type ProfileSectionId = 'identite' | 'parcours' | 'competences' | 'objectif'

export const PROFILE_SECTIONS: { id: ProfileSectionId; labelId: string; icon: LucideIcon }[] = [
  { id: 'identite', labelId: 'candidate.profile.nav.identity', icon: User },
  { id: 'parcours', labelId: 'candidate.profile.nav.career', icon: GraduationCap },
  { id: 'competences', labelId: 'candidate.profile.nav.skills', icon: Sparkles },
  { id: 'objectif', labelId: 'candidate.profile.nav.objective', icon: Target },
]

/** Free-text `educationLevel` field — stable codes stored server-side, labels translated client-side. */
export const EDUCATION_LEVEL_OPTIONS = [
  { value: 'BAC', labelId: 'candidate.profile.education.bac' },
  { value: 'BAC_2', labelId: 'candidate.profile.education.bac2' },
  { value: 'BAC_3', labelId: 'candidate.profile.education.bac3' },
  { value: 'BAC_5', labelId: 'candidate.profile.education.bac5' },
  { value: 'BAC_8', labelId: 'candidate.profile.education.bac8' },
  { value: 'OTHER', labelId: 'candidate.profile.education.other' },
] as const

export const SITUATION_OPTIONS: { value: ProfileSituation; labelId: string; icon: LucideIcon }[] = [
  { value: ProfileSituation.Employed, labelId: 'candidate.profile.situation.employed', icon: Briefcase },
  { value: ProfileSituation.JobSearch, labelId: 'candidate.profile.situation.jobSearch', icon: Search },
  { value: ProfileSituation.Reconversion, labelId: 'candidate.profile.situation.reconversion', icon: RefreshCw },
  { value: ProfileSituation.Student, labelId: 'candidate.profile.situation.student', icon: GraduationCap },
]

export const OBJECTIVE_OPTIONS: { value: ProfileObjective; labelId: string; icon: LucideIcon }[] = [
  { value: ProfileObjective.FindJob, labelId: 'candidate.profile.objective.findJob', icon: Briefcase },
  { value: ProfileObjective.ImproveCv, labelId: 'candidate.profile.objective.improveCv', icon: FileText },
  { value: ProfileObjective.CareerChange, labelId: 'candidate.profile.objective.careerChange', icon: RefreshCw },
  { value: ProfileObjective.DevelopSkills, labelId: 'candidate.profile.objective.developSkills', icon: BookOpen },
  { value: ProfileObjective.Network, labelId: 'candidate.profile.objective.network', icon: Handshake },
]

export const MAX_STRENGTHS = 3
export const MAX_IMPROVEMENTS = 3
export const MAX_SKILLS = 30
export const MAX_BIO_LENGTH = 500
