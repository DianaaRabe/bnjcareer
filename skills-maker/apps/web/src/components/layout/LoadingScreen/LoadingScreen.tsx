import { FormattedMessage } from "react-intl";

/** Full-page placeholder while a role gate waits for `me`. */
export const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-muted">
    <div className="flex flex-col items-center gap-4">
      <div className="relative size-10">
        <div className="absolute inset-0 rounded-full border-[3px] border-border" />
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-primary" />
      </div>
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <FormattedMessage id="common.loading" />
        <span className="inline-flex gap-[3px]">
          <span className="size-1 animate-pulse rounded-full bg-muted-foreground [animation-delay:0ms]" />
          <span className="size-1 animate-pulse rounded-full bg-muted-foreground [animation-delay:150ms]" />
          <span className="size-1 animate-pulse rounded-full bg-muted-foreground [animation-delay:300ms]" />
        </span>
      </p>
    </div>
  </div>
);
