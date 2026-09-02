import en from '@/lang/en-US.json'
import fr from '@/lang/fr.json'

export const SUPPORTED_LOCALES = ['fr', 'en'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'fr'

export const messages: Record<Locale, Record<string, string>> = { fr, en }

/** Browser language reduced to its base tag, falling back to the default locale. */
export const getNavigatorLocale = (): Locale => {
  const detected =
    (navigator.languages && navigator.languages[0]) || navigator.language || DEFAULT_LOCALE
  const base = detected.split('-')[0]
  return SUPPORTED_LOCALES.includes(base as Locale) ? (base as Locale) : DEFAULT_LOCALE
}

export const locale = getNavigatorLocale()
export const localeMessages = messages[locale]
