import type { FormEvent } from 'react'
import { RotateCcw, Send, Sparkles, Square, TriangleAlert } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { AssistantMessages } from './AssistantMessages'
import { useAssistantPanel } from './useAssistantPanel'

/** Opens on demand rather than taking a third of the page it sits on. */
export const AssistantPanel = () => {
  const assistant = useAssistantPanel()
  const intl = useIntl()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    assistant.send()
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="lg" className="gap-2">
          <Sparkles className="size-4" />
          <FormattedMessage id="assistant.open" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-[560px]">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle className="flex items-center gap-2 text-[15px]">
            <Sparkles className="size-4 text-primary" />
            <FormattedMessage id="assistant.title" />
          </SheetTitle>
          <SheetDescription className="text-[12.5px]">
            <FormattedMessage id="assistant.subtitle" />
          </SheetDescription>
          {assistant.messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={assistant.reset}
              className="w-fit gap-2 text-muted-foreground"
            >
              <RotateCcw className="size-3.5" />
              <FormattedMessage id="assistant.reset" />
            </Button>
          )}
        </SheetHeader>

        <AssistantMessages messages={assistant.messages} isStreaming={assistant.isStreaming} />

        {assistant.hasError && (
          <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2">
            <TriangleAlert className="size-4 flex-none text-destructive" />
            <p className="flex-1 text-[12.5px] text-destructive">
              <FormattedMessage id="assistant.error" />
            </p>
            {assistant.canRetry && (
              <Button size="sm" variant="outline" onClick={assistant.retry}>
                <FormattedMessage id="assistant.retry" />
              </Button>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-border px-4 py-4">
          {assistant.messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {assistant.suggestions.map((labelId) => (
                <button
                  key={labelId}
                  type="button"
                  onClick={() => assistant.setDraft(intl.formatMessage({ id: labelId }))}
                  className="cursor-pointer rounded-full border border-border px-4 py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <FormattedMessage id={labelId} />
                </button>
              ))}
            </div>
          )}

          <form className="flex items-center gap-2" onSubmit={handleSubmit}>
            <Input
              value={assistant.draft}
              onChange={(event) => assistant.setDraft(event.target.value)}
              placeholder={intl.formatMessage({ id: 'assistant.input.placeholder' })}
              aria-label={intl.formatMessage({ id: 'assistant.input.label' })}
              disabled={assistant.isStreaming}
            />
            {assistant.isStreaming ? (
              <Button
                type="button"
                size="icon-lg"
                variant="outline"
                onClick={assistant.stop}
                aria-label={intl.formatMessage({ id: 'assistant.stop' })}
              >
                <Square className="size-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon-lg"
                disabled={!assistant.draft.trim()}
                aria-label={intl.formatMessage({ id: 'assistant.send' })}
              >
                <Send className="size-4" />
              </Button>
            )}
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
