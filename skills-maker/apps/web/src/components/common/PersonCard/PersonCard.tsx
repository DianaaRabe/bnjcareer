import type { ReactNode } from 'react'

import { Card, CardContent } from '@/components/ui/card'

type PersonCardProps = {
  identity: ReactNode
  bio?: string | null
  /** Pinned to the bottom via mt-auto — badges, meta text, CTA button. */
  footer: ReactNode
}

/** Shared card shell for a directory entry (coach, candidate…): identity, clamped bio, bottom-pinned footer. */
export const PersonCard = ({ identity, bio, footer }: PersonCardProps) => (
  <Card className="flex h-full w-full flex-col gap-4 p-4">
    {identity}

    <CardContent className="flex flex-1 flex-col gap-4 p-0">
      {bio && (
        // Clamped rather than truncated: the full text stays available on a detail page.
        <p className="line-clamp-4 text-[13px] leading-relaxed text-muted-foreground">{bio}</p>
      )}

      <div className="mt-auto flex flex-col gap-4">{footer}</div>
    </CardContent>
  </Card>
)
