import { Camera, User } from 'lucide-react'
import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MAX_BIO_LENGTH } from '../constants'

type IdentitySectionProps = {
  avatarUrl: string | null
  onAvatarChange: (file: File | undefined) => void
  firstName: string
  onFirstNameChange: (v: string) => void
  lastName: string
  onLastNameChange: (v: string) => void
  birthDate: string
  onBirthDateChange: (v: string) => void
  phone: string
  onPhoneChange: (v: string) => void
  bio: string
  onBioChange: (v: string) => void
}

export const IdentitySection = ({
  avatarUrl,
  onAvatarChange,
  firstName,
  onFirstNameChange,
  lastName,
  onLastNameChange,
  birthDate,
  onBirthDateChange,
  phone,
  onPhoneChange,
  bio,
  onBioChange,
}: IdentitySectionProps) => {
  const intl = useIntl()
  const [dragging, setDragging] = useState(false)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-5">
        <div className="flex flex-col items-center gap-2">
          <label
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              onAvatarChange(e.dataTransfer.files[0])
            }}
            className={`group relative flex size-24 cursor-pointer items-center justify-center rounded-full outline-offset-2 ${
              dragging ? 'outline outline-2 outline-ring' : ''
            }`}
          >
            <Avatar size="lg" className="size-24">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
              <AvatarFallback>
                <User className="size-10 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="size-[22px] text-white" />
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => onAvatarChange(e.target.files?.[0])}
            />
          </label>
          <p className="text-center text-[11px] text-muted-foreground">
            <FormattedMessage id="candidate.profile.identity.avatar.hint" />
          </p>
        </div>
        <div className="grid min-w-60 flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>
              <FormattedMessage id="candidate.profile.identity.firstName.label" /> <span className="text-primary">*</span>
            </Label>
            <Input value={firstName} onChange={(e) => onFirstNameChange(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>
              <FormattedMessage id="candidate.profile.identity.lastName.label" /> <span className="text-primary">*</span>
            </Label>
            <Input value={lastName} onChange={(e) => onLastNameChange(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>
              <FormattedMessage id="candidate.profile.identity.birthDate.label" />
            </Label>
            <Input type="date" value={birthDate} onChange={(e) => onBirthDateChange(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>
              <FormattedMessage id="candidate.profile.identity.phone.label" />
            </Label>
            <Input
              type="tel"
              placeholder={intl.formatMessage({ id: 'candidate.profile.identity.phone.placeholder' })}
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>
          <FormattedMessage id="candidate.profile.identity.bio.label" />
        </Label>
        <Textarea
          className="h-[300px] resize-y"
          maxLength={MAX_BIO_LENGTH}
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
        />
        <p className="self-end text-xs text-muted-foreground">
          <FormattedMessage id="candidate.profile.identity.bio.counter" values={{ count: bio.length, max: MAX_BIO_LENGTH }} />
        </p>
      </div>
    </div>
  )
}
