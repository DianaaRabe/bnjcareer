import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { LoadingScreen } from '@/components/layout/LoadingScreen/LoadingScreen'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Button } from '@/components/ui/button'
import { CareerSection } from './components/CareerSection'
import { IdentitySection } from './components/IdentitySection'
import { ObjectiveSection } from './components/ObjectiveSection'
import { ProfileNav } from './components/ProfileNav'
import { SkillsSection } from './components/SkillsSection'
import { useProfile } from './useProfile'

export const Profile = () => {
  const p = useProfile()

  if (p.isLoading) {
    return <LoadingScreen />
  }

  if (p.loadError) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          <FormattedMessage id="common.error" />
        </p>
        <Button variant="outline" onClick={() => void p.retry()}>
          <FormattedMessage id="common.retry" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titleId="candidate.profile.title"
        descriptionId="candidate.profile.subtitle"
        actions={
          <div className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
            {p.saveStatus === 'saving' && <Loader2 className="size-3.5 animate-spin" />}
            {p.saveStatus === 'saved' && <CheckCircle2 className="size-3.5 text-success" />}
            {p.saveStatus === 'error' && <AlertTriangle className="size-3.5 text-destructive" />}
            <FormattedMessage id={`candidate.profile.saveStatus.${p.saveStatus}`} />
          </div>
        }
      />

      <div className="mx-auto w-full max-w-[900px]">
        <ProfileNav active={p.activeSection} onChange={p.goToSection} />
      </div>

      <div className="mx-auto w-full max-w-[900px]">
        {p.activeSection === 'identite' && (
          <IdentitySection
            avatarUrl={p.avatarUrl}
            onAvatarChange={p.handleAvatarChange}
            firstName={p.firstName}
            onFirstNameChange={p.setFirstName}
            lastName={p.lastName}
            onLastNameChange={p.setLastName}
            birthDate={p.birthDate}
            onBirthDateChange={p.setBirthDate}
            phone={p.phone}
            onPhoneChange={p.setPhone}
            bio={p.bio}
            onBioChange={p.setBio}
          />
        )}
        {p.activeSection === 'parcours' && (
          <CareerSection
            educationLevel={p.educationLevel}
            onEducationChange={p.setEducationLevel}
            school={p.school}
            onSchoolChange={p.setSchool}
            sector={p.sector}
            onSectorChange={p.setSector}
            situation={p.situation}
            onSituationChange={p.setSituation}
          />
        )}
        {p.activeSection === 'competences' && (
          <SkillsSection
            strengths={p.strengths}
            onAddStrength={p.addStrength}
            onRemoveStrength={p.removeStrength}
            improvements={p.improvements}
            onAddImprovement={p.addImprovement}
            onRemoveImprovement={p.removeImprovement}
            skills={p.skills}
            onAddSkill={p.addSkill}
            onRemoveSkill={p.removeSkill}
          />
        )}
        {p.activeSection === 'objectif' && <ObjectiveSection value={p.objective} onChange={p.setObjective} />}
      </div>
    </div>
  )
}
