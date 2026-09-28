import type { ReactNode } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const initialsOf = (firstName?: string | null, lastName?: string | null) =>
  [firstName, lastName]
    .map((part) => part?.trim()?.[0] ?? '')
    .join('')
    .toUpperCase()

type PersonIdentityProps = {
  firstName?: string | null
  lastName?: string | null
  avatarUrl?: string | null
  name: ReactNode
  /** Icon + text line under the name (specialty, sector…). */
  subtitle?: ReactNode
  /** Pill row under the subtitle (experience, rating, session count…). */
  meta?: ReactNode
}

/** Shared avatar + name + subtitle + pills block for a person card or row. */
export const PersonIdentity = ({ firstName, lastName, avatarUrl, name, subtitle, meta }: PersonIdentityProps) => (
  <div className="flex items-start gap-4">
    <Avatar className="size-12">
      {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
      <AvatarFallback className="bg-accent text-sm font-bold text-primary">
        {initialsOf(firstName, lastName)}
      </AvatarFallback>
    </Avatar>

    <div className="min-w-0 flex-1">
      <p className="truncate text-[15px] font-bold">{name}</p>

      {subtitle && (
        <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-primary">{subtitle}</p>
      )}

      {meta && <div className="mt-1.5 flex flex-wrap items-center gap-2">{meta}</div>}
    </div>
  </div>
)
