import { Routes, Route, Navigate } from 'react-router-dom'

import { HomeRedirect } from '@/components/auth/HomeRedirect'
import { AppShell } from '@/components/layout/AppShell/AppShell'
import {
  CANDIDATE_NAV_ITEMS,
  CANDIDATE_SECONDARY_NAV_ITEMS,
  COACH_NAV_ITEMS,
  COACH_SECONDARY_NAV_ITEMS,
  type NavItem,
} from '@/constants/navigation'
import { ROUTES } from '@/constants/routes'
import { PORTAL_ROLES } from '@/lib/rbac'
import { Login } from '@/pages/Auth/Login'
import { Coaches as CandidateCoaches } from '@/pages/Candidate/Coaches/Coaches'
import { Coaching as CandidateCoaching } from '@/pages/Candidate/Coaching/Coaching'
import { Dashboard as CandidateDashboard } from '@/pages/Candidate/Dashboard/Dashboard'
import { Formations as CandidateFormations } from '@/pages/Candidate/Formations/Formations'
import { TrainingDetail as CandidateTrainingDetail } from '@/pages/Candidate/TrainingDetail/TrainingDetail'
import { Cv as CandidateCv } from '@/pages/Candidate/Cv/Cv'
import { Jobs as CandidateJobs } from '@/pages/Candidate/Jobs/Jobs'
import { Matching as CandidateMatching } from '@/pages/Candidate/Matching/Matching'
import { Profile as CandidateProfile } from '@/pages/Candidate/Profile/Profile'
import { Resources as CandidateResources } from '@/pages/Candidate/Resources/Resources'
import { CoachAgreement } from '@/pages/Coach/Agreement/CoachAgreement'
import { CoachShell } from '@/pages/Coach/CoachShell'
import { Dashboard as CoachDashboard } from '@/pages/Coach/Dashboard'
import { ComingSoon } from '@/pages/ComingSoon/ComingSoon'

// Every nav entry needs a route — real pages replace these placeholders one by one.
const placeholdersOf = (items: NavItem[][], excludedRoutes: string[]) =>
  items.flat().filter(({ to }) => !excludedRoutes.includes(to))

const CANDIDATE_PLACEHOLDERS = placeholdersOf(
  [CANDIDATE_NAV_ITEMS, CANDIDATE_SECONDARY_NAV_ITEMS],
  [
    ROUTES.candidate.dashboard,
    ROUTES.candidate.cv,
    ROUTES.candidate.jobs,
    ROUTES.candidate.matching,
    ROUTES.candidate.coaching,
    ROUTES.candidate.formations,
    ROUTES.candidate.coaches,
    ROUTES.candidate.resources,
    ROUTES.candidate.profile,
  ],
)
const COACH_PLACEHOLDERS = placeholdersOf(
  [COACH_NAV_ITEMS, COACH_SECONDARY_NAV_ITEMS],
  [ROUTES.coach.dashboard],
)

// Routing skeleton — each area will point to its pages in src/pages/.
export function App() {
  return (
    <Routes>
      <Route path={ROUTES.login} element={<Login />} />

      <Route
        path={ROUTES.candidate.root}
        element={
          <AppShell
            portalLabelId="nav.candidate.portal"
            navItems={CANDIDATE_NAV_ITEMS}
            secondaryNavItems={CANDIDATE_SECONDARY_NAV_ITEMS}
            rolesAuthorized={PORTAL_ROLES.candidate}
          />
        }
      >
        <Route index element={<CandidateDashboard />} />
        <Route path={ROUTES.candidate.cv} element={<CandidateCv />} />
        <Route path={ROUTES.candidate.jobs} element={<CandidateJobs />} />
        <Route path={ROUTES.candidate.matching} element={<CandidateMatching />} />
        <Route path={ROUTES.candidate.coaching} element={<CandidateCoaching />} />
        <Route path={ROUTES.candidate.formations} element={<CandidateFormations />} />
        <Route
          path={`${ROUTES.candidate.formations}/:trainingId`}
          element={<CandidateTrainingDetail />}
        />
        <Route path={ROUTES.candidate.coaches} element={<CandidateCoaches />} />
        <Route path={ROUTES.candidate.resources} element={<CandidateResources />} />
        <Route path={ROUTES.candidate.profile} element={<CandidateProfile />} />
        {/* Reached from the dashboard, not from the nav. */}
        <Route
          path={ROUTES.candidate.applications}
          element={
            <ComingSoon titleId="candidate.applications.title" eyebrowId="nav.candidate.portal" />
          }
        />
        {CANDIDATE_PLACEHOLDERS.map(({ to, labelId }) => (
          <Route
            key={to}
            path={to}
            element={<ComingSoon titleId={labelId} eyebrowId="nav.candidate.portal" />}
          />
        ))}
      </Route>

      {/* Outside the coach shell on purpose — it is the gate to it. */}
      <Route path={ROUTES.coach.agreement} element={<CoachAgreement />} />

      <Route path={ROUTES.coach.root} element={<CoachShell />}>
        <Route index element={<CoachDashboard />} />
        {COACH_PLACEHOLDERS.map(({ to, labelId }) => (
          <Route
            key={to}
            path={to}
            element={<ComingSoon titleId={labelId} eyebrowId="nav.coach.portal" />}
          />
        ))}
      </Route>

      {/* <Route path="/admin/*" element={<AdminShell />} /> */}

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
    </Routes>
  )
}
