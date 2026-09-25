import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          // Tinted surface + solid-color text, matching the bg-{color}/15 text-{color} badges used across the app.
          "--success-bg": "color-mix(in oklch, var(--popover), var(--success) 12%)",
          "--success-border": "color-mix(in oklch, var(--popover), var(--success) 30%)",
          "--success-text": "var(--success)",
          "--error-bg": "color-mix(in oklch, var(--popover), var(--destructive) 12%)",
          "--error-border": "color-mix(in oklch, var(--popover), var(--destructive) 30%)",
          "--error-text": "var(--destructive)",
          "--warning-bg": "color-mix(in oklch, var(--popover), var(--warning) 12%)",
          "--warning-border": "color-mix(in oklch, var(--popover), var(--warning) 30%)",
          "--warning-text": "var(--warning)",
          "--info-bg": "color-mix(in oklch, var(--popover), var(--primary) 12%)",
          "--info-border": "color-mix(in oklch, var(--popover), var(--primary) 30%)",
          "--info-text": "var(--primary)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
