import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { LoadingScreen } from '@/components/layout/LoadingScreen/LoadingScreen'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Button } from '@/components/ui/button'
import { CoachSettingsSection } from './components/CoachSettingsSection'
import { IdentitySection } from './components/IdentitySection'
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
        <Button variant="outline" onClick={() => p.retry()}>
          <FormattedMessage id="common.retry" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titleId="coach.profile.title"
        descriptionId="coach.profile.subtitle"
        actions={
          <div className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
            {p.saveStatus === 'saving' && <Loader2 className="size-3.5 animate-spin" />}
            {p.saveStatus === 'saved' && <CheckCircle2 className="size-3.5 text-success" />}
            {p.saveStatus === 'error' && <AlertTriangle className="size-3.5 text-destructive" />}
            <FormattedMessage id={`coach.profile.saveStatus.${p.saveStatus}`} />
          </div>
        }
      />

      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-8 border-t border-border pt-8">
        <IdentitySection
          avatarUrl={p.avatarUrl}
          onAvatarChange={p.handleAvatarChange}
          firstName={p.firstName}
          onFirstNameChange={p.setFirstName}
          lastName={p.lastName}
          onLastNameChange={p.setLastName}
          phone={p.phone}
          onPhoneChange={p.setPhone}
          bio={p.bio}
          onBioChange={p.setBio}
        />

        <div className="flex flex-col gap-5 border-t border-border pt-8">
          <h2 className="text-[15px] font-semibold">
            <FormattedMessage id="coach.profile.settings.title" />
          </h2>
          <CoachSettingsSection
            specialty={p.specialty}
            onSpecialtyChange={p.setSpecialty}
            yearsExperience={p.yearsExperience}
            onYearsExperienceChange={p.setYearsExperience}
            certifications={p.certifications}
            onAddCertification={p.addCertification}
            onRemoveCertification={p.removeCertification}
            expertise={p.expertise}
            onToggleExpertise={p.toggleExpertise}
            acceptingClients={p.acceptingClients}
            onAcceptingClientsChange={p.setAcceptingClients}
            published={p.published}
            onPublishedChange={p.setPublished}
            rating={p.rating}
          />
        </div>
      </div>
    </div>
  )
}
