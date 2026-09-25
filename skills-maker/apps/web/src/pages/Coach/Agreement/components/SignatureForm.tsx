import type { FormEvent, ReactNode } from 'react'
import { CheckCircle2, Loader2, PenLine, TriangleAlert } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { useCoachAgreement } from '../useCoachAgreement'

type SignatureFormProps = {
  agreement: ReturnType<typeof useCoachAgreement>
  contractVersion: string
}

type ConsentProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled: boolean
  children: ReactNode
}

const Consent = ({ checked, onChange, disabled, children }: ConsentProps) => (
  <label className="flex cursor-pointer items-start gap-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      disabled={disabled}
      className="mt-1 size-4 flex-none cursor-pointer accent-primary"
    />
    <span className="text-[13px] leading-relaxed text-muted-foreground">{children}</span>
  </label>
)

export const SignatureForm = ({ agreement, contractVersion }: SignatureFormProps) => {
  const intl = useIntl()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    agreement.submit()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-t border-border pt-8">
        <h2 className="flex items-center gap-2 text-[14.5px] font-semibold">
          <PenLine className="size-4 flex-none text-primary" strokeWidth={2} />
          <FormattedMessage id="coach.agreement.sign.title" />
        </h2>

        <Consent
          checked={agreement.confirmsIdentity}
          onChange={agreement.setConfirmsIdentity}
          disabled={agreement.isSigning}
        >
          <FormattedMessage id="coach.agreement.sign.identity" />
        </Consent>

        <Consent
          checked={agreement.acceptsTerms}
          onChange={agreement.setAcceptsTerms}
          disabled={agreement.isSigning}
        >
          <FormattedMessage id="coach.agreement.sign.terms" />
        </Consent>

        <div className="flex flex-col gap-2">
          <Label htmlFor="signedName">
            <FormattedMessage id="coach.agreement.sign.name.label" />
          </Label>
          <Input
            id="signedName"
            value={agreement.signedName}
            onChange={(event) => agreement.setSignedName(event.target.value)}
            placeholder={intl.formatMessage({ id: 'coach.agreement.sign.name.placeholder' })}
            disabled={agreement.isSigning}
          />
          <p className="text-[12px] text-muted-foreground">
            <FormattedMessage id="coach.agreement.sign.name.legal" />
          </p>
        </div>

        <div className="flex flex-col gap-1 rounded-xl bg-muted p-4">
          <p className="text-[12px] font-semibold text-foreground">
            <FormattedMessage id="coach.agreement.audit.title" />
          </p>
          <ul className="flex list-disc flex-col gap-1 pl-4 text-[12px] text-muted-foreground">
            <li>
              <FormattedMessage
                id="coach.agreement.audit.identifier"
                values={{ email: agreement.email }}
              />
            </li>
            <li>
              <FormattedMessage id="coach.agreement.audit.timestamp" />
            </li>
            <li>
              <FormattedMessage id="coach.agreement.audit.device" />
            </li>
            <li>
              <FormattedMessage
                id="coach.agreement.audit.version"
                values={{ version: contractVersion }}
              />
            </li>
          </ul>
        </div>

        {agreement.errorMessageId && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4"
          >
            <TriangleAlert className="mt-0.5 size-4 flex-none text-destructive" />
            <p className="text-[13px] text-destructive">
              <FormattedMessage id={agreement.errorMessageId} />
            </p>
          </div>
        )}

        <Button type="submit" size="lg" className="w-full gap-2" disabled={!agreement.canSign}>
          {agreement.isSigning ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          <FormattedMessage
            id={agreement.isSigning ? 'coach.agreement.sign.submitting' : 'coach.agreement.sign.submit'}
          />
        </Button>
    </form>
  )
}
