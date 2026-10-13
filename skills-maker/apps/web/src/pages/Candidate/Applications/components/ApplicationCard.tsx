import { Bot, Building2, ExternalLink, Hand, Loader2, MailCheck, MapPin, Send } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { RelativeTime } from '@/components/common/RelativeTime/RelativeTime'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ApplicationSource,
  ApplicationStatus,
  AutomationStage,
  EmailDeliveryStatus,
} from '@/gql/graphql'
import type { CandidateApplication } from '../useApplicationsHub'

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost'

/** Tracking status → badge tone. INTERVIEW is the win state, so it gets the primary fill. */
const STATUS_VARIANT: Record<ApplicationStatus, BadgeVariant> = {
  [ApplicationStatus.Interview]: 'default',
  [ApplicationStatus.Sent]: 'secondary',
  [ApplicationStatus.Pending]: 'outline',
  [ApplicationStatus.Rejected]: 'destructive',
}

/** Delivery status → badge tone. Bounced/failed read as destructive; the rest stay muted. */
const DELIVERY_VARIANT: Record<EmailDeliveryStatus, BadgeVariant> = {
  [EmailDeliveryStatus.Delivered]: 'secondary',
  [EmailDeliveryStatus.Sent]: 'secondary',
  [EmailDeliveryStatus.Sending]: 'outline',
  [EmailDeliveryStatus.Queued]: 'outline',
  [EmailDeliveryStatus.Bounced]: 'destructive',
  [EmailDeliveryStatus.Failed]: 'destructive',
}

type Props = {
  app: CandidateApplication
  onSend: (id: string) => void
  isSending: boolean
}

export const ApplicationCard = ({ app, onSend, isSending }: Props) => {
  const isAutomated = app.source === ApplicationSource.Automated
  const delivery = app.delivery
  const replied = Boolean(delivery?.repliedAt)
  // A prepared automated application the candidate can send themselves (skill §8 approval path).
  const canSend = isAutomated && app.stage === AutomationStage.ReadyToSend

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="truncate font-semibold text-foreground">{app.jobTitle}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {app.company && (
                <span className="inline-flex items-center gap-1">
                  <Building2 className="size-3.5" />
                  {app.company}
                </span>
              )}
              {app.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {app.location}
                </span>
              )}
            </div>
          </div>
          {typeof app.matchScore === 'number' && (
            <Badge variant="secondary" className="shrink-0">
              <FormattedMessage
                id="candidate.applications.review.score"
                values={{ score: Math.round(app.matchScore) }}
              />
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Source: how the application was created. */}
          <Badge variant="outline" className="gap-1">
            {isAutomated ? <Bot className="size-3" /> : <Hand className="size-3" />}
            <FormattedMessage
              id={isAutomated ? 'candidate.applications.source.automated' : 'candidate.applications.source.manual'}
            />
          </Badge>

          {/* Tracking status, shared vocabulary with the dashboard. */}
          <Badge variant={STATUS_VARIANT[app.status]}>
            <FormattedMessage id={`candidate.applications.statusLabel.${app.status}`} />
          </Badge>

          {/* Delivery, only once an email exists for this application. */}
          {delivery && (
            <Badge variant={replied ? 'default' : DELIVERY_VARIANT[delivery.status]} className="gap-1">
              {replied && <MailCheck className="size-3" />}
              <FormattedMessage
                id={
                  replied
                    ? 'candidate.applications.delivery.replied'
                    : `candidate.applications.delivery.${delivery.status}`
                }
              />
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            <FormattedMessage
              id="candidate.applications.list.applied"
              values={{ when: <RelativeTime value={app.sentAt ?? app.createdAt} /> }}
            />
          </span>
          <div className="flex items-center gap-2">
            {app.applyUrl && (
              <Button asChild variant="ghost" size="sm">
                <a href={app.applyUrl} target="_blank" rel="noreferrer noopener">
                  <ExternalLink className="size-3.5" />
                  <FormattedMessage id="candidate.applications.review.viewOffer" />
                </a>
              </Button>
            )}
            {canSend && (
              <Button size="sm" onClick={() => onSend(app.id)} disabled={isSending}>
                {isSending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
                <FormattedMessage id="candidate.applications.send.action" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
