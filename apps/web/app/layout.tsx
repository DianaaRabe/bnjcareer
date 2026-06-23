import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TenantProvider } from '@/lib/tenant/context'
import { getTenant, buildTenantCSSVars } from '@/lib/tenant/server'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

// ── Metadata — overridden per-tenant ─────────────────────────────────────────
export async function generateMetadata(): Promise<Metadata> {
  const tenant = getTenant()
  const { seo, branding } = tenant

  return {
    title:       seo.title,
    description: seo.description,
    keywords:    seo.keywords,
    metadataBase: new URL(seo.canonicalBase),
    openGraph: {
      title:       seo.title,
      description: seo.description,
      images:      [seo.ogImage],
      locale:      tenant.locale === 'fr' ? 'fr_FR' : tenant.locale === 'en' ? 'en_US' : 'he_IL',
      type:        'website',
    },
    icons: {
      icon: branding.favicon,
    },
    alternates: {
      canonical: seo.canonicalBase,
    },
  }
}

// ── Root Layout ───────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const tenant = getTenant()
  const cssVars = buildTenantCSSVars(tenant)
  const isFR = tenant.id === 'fr'  // FR vars already set in globals.css

  return (
    <html
      lang={tenant.locale}
      dir={tenant.dir}
      data-tenant={tenant.id}
      className={`${inter.variable} font-sans h-full antialiased`}
    >
      <head>
        {/* Premium display font — loaded only for tenants that define one */}
        {tenant.branding.googleFontUrl && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href={tenant.branding.googleFontUrl} rel="stylesheet" />
          </>
        )}
        {/* Inject tenant CSS variable overrides (skip for FR — already in globals.css) */}
        {!isFR && (
          <style dangerouslySetInnerHTML={{ __html: cssVars }} />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        {/* TenantProvider makes the config available to all client components */}
        <TenantProvider config={tenant}>
          {children}
        </TenantProvider>
      </body>
    </html>
  )
}
