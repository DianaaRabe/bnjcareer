import type { ReactNode } from 'react'

type PersonRowProps = {
  identity: ReactNode
  bio?: string | null
  /** Badges / meta text next to the bio. */
  meta?: ReactNode
  action: ReactNode
}

/** Shared row shell for a directory entry (coach, candidate…): identity, clamped bio, meta, trailing action. */
export const PersonRow = ({ identity, bio, meta, action }: PersonRowProps) => (
  <li className="flex flex-col gap-4 border-b border-border p-4 last:border-b-0 hover:bg-accent lg:flex-row lg:items-center lg:gap-4">
    <div className="min-w-0 lg:w-[300px] lg:flex-none">{identity}</div>

    <div className="min-w-0 flex-1 lg:flex lg:flex-col lg:gap-2">
      {bio && <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{bio}</p>}
      {meta}
    </div>

    <div className="flex flex-none items-center gap-2">{action}</div>
  </li>
)
