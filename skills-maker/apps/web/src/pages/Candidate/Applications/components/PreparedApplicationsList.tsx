import { useState } from 'react'
import { Building2, CheckCircle2, ExternalLink, Loader2, Mail, MapPin, Send, X } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { MyPreparedApplicationsQuery } from '@/gql/graphql'

type Prepared = MyPreparedApplicationsQuery['myPreparedApplications'][number]

type Props = {
  applications: Prepared[]
  onCancel: (id: string) => void
  onSend: (id: string) => void
  sendingId: string | null
}

const PreparedCard = ({
  app,
  onCancel,
  onSend,
  sending,
}: {
  app: Prepared
  onCancel: (id: string) => void
  onSend: (id: string) => void
  sending: boolean
}) => {
  const intl = useIntl()
  const [expanded, setExpanded] = useState(false)

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
          <Badge variant="outline">{app.stage}</Badge>
          {app.recipientEmail ? (
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <Mail className="size-3.5" />
              <span className="font-medium">
                <FormattedMessage id="candidate.applications.review.recipient" />:
              </span>
              <span className="text-foreground">{app.recipientEmail}</span>
            </span>
          ) : app.hasContact ? (
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="size-3.5" />
              <FormattedMessage id="candidate.applications.review.contactFound" />
            </span>
          ) : (
            <span className="text-muted-foreground">
              <FormattedMessage id="candidate.applications.review.noContact" />
            </span>
          )}
        </div>

        {app.coverLetter && (
          <div className="flex flex-col gap-1.5">
            <p
              className={`whitespace-pre-line rounded-md bg-muted/40 p-2.5 text-xs text-muted-foreground ${
                expanded ? '' : 'line-clamp-3'
              }`}
            >
              {app.coverLetter}
            </p>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="self-start text-xs font-medium text-primary hover:underline"
            >
              <FormattedMessage
                id={
                  expanded
                    ? 'candidate.applications.review.hideLetter'
                    : 'candidate.applications.review.showLetter'
                }
              />
            </button>
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          {app.applyUrl && (
            <Button asChild variant="ghost" size="sm">
              <a href={app.applyUrl} target="_blank" rel="noreferrer noopener">
                <ExternalLink className="size-3.5" />
                <FormattedMessage id="candidate.applications.review.viewOffer" />
              </a>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCancel(app.id)}
            disabled={sending}
            aria-label={intl.formatMessage({ id: 'candidate.applications.review.cancel' })}
          >
            <X className="size-3.5" />
            <FormattedMessage id="candidate.applications.review.cancel" />
          </Button>
          <Button
            size="sm"
            onClick={() => onSend(app.id)}
            disabled={sending || !app.recipientEmail}
            aria-label={intl.formatMessage({ id: 'candidate.applications.review.send' })}
          >
            {sending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
            <FormattedMessage id="candidate.applications.review.send" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export const PreparedApplicationsList = ({ applications, onCancel, onSend, sendingId }: Props) => {
  if (applications.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        titleId="candidate.applications.review.empty.title"
        descriptionId="candidate.applications.review.empty.description"
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {applications.map((app) => (
        <PreparedCard
          key={app.id}
          app={app}
          onCancel={onCancel}
          onSend={onSend}
          sending={sendingId === app.id}
        />
      ))}
    </div>
  )
}
