import {
  BookOpen,
  Briefcase,
  Calendar,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutGrid,
  MessageSquare,
  Target,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { ROUTES } from './routes'

export type NavItem = {
  to: string
  labelId: string
  icon: LucideIcon
  /** Exact match only — for an index route whose path prefixes its siblings. */
  end?: boolean
}

export const CANDIDATE_NAV_ITEMS: NavItem[] = [
  { to: ROUTES.candidate.dashboard, labelId: 'nav.candidate.dashboard', icon: LayoutGrid, end: true },
  { to: ROUTES.candidate.cv, labelId: 'nav.candidate.cv', icon: FileText },
  { to: ROUTES.candidate.jobs, labelId: 'nav.candidate.jobs', icon: Briefcase },
  { to: ROUTES.candidate.matching, labelId: 'nav.candidate.matching', icon: Target },
  { to: ROUTES.candidate.coaching, labelId: 'nav.candidate.coaching', icon: Calendar },
  { to: ROUTES.candidate.formations, labelId: 'nav.candidate.formations', icon: GraduationCap },
  { to: ROUTES.candidate.coaches, labelId: 'nav.candidate.coaches', icon: Users },
  { to: ROUTES.candidate.resources, labelId: 'nav.candidate.resources', icon: BookOpen },
  { to: ROUTES.candidate.subscriptions, labelId: 'nav.candidate.subscriptions', icon: CreditCard },
]

export const COACH_NAV_ITEMS: NavItem[] = [
  { to: ROUTES.coach.dashboard, labelId: 'nav.coach.dashboard', icon: LayoutGrid, end: true },
  { to: ROUTES.coach.candidates, labelId: 'nav.coach.candidates', icon: Users },
  { to: ROUTES.coach.formations, labelId: 'nav.coach.formations', icon: GraduationCap },
  { to: ROUTES.coach.sessions, labelId: 'nav.coach.sessions', icon: Calendar },
  { to: ROUTES.coach.messages, labelId: 'nav.coach.messages', icon: MessageSquare },
  { to: ROUTES.coach.resources, labelId: 'nav.coach.resources', icon: BookOpen },
]

/** Account-level entries — rendered after a separator at the end of the nav. */
export const CANDIDATE_SECONDARY_NAV_ITEMS: NavItem[] = [
  { to: ROUTES.candidate.profile, labelId: 'nav.candidate.profile', icon: User },
]

export const COACH_SECONDARY_NAV_ITEMS: NavItem[] = [
  { to: ROUTES.coach.profile, labelId: 'nav.coach.profile', icon: User },
]
