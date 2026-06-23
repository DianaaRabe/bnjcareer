// ─────────────────────────────────────────────────────────────────────────────
// i18n — Lightweight translation system
// Compatible with next-intl migration in the future.
// RTL support: driven by tenant config `dir` field.
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import { useTenant } from '@/lib/tenant/context'
import fr, { type TranslationKeys } from '@/locales/fr'
import en from '@/locales/en'
import type { Locale } from '@/tenants/types'

const LOCALES: Record<Locale, TranslationKeys> = {
  fr,
  en,
  he: fr, // Hebrew UI strings fall back to FR until translated
}

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : K
      : never
    }[keyof T]
  : never

type FlatKey = NestedKeyOf<TranslationKeys>

/**
 * Resolve a dot-notation key against the translation object.
 * Example: t('common.save') → 'Sauvegarder'
 */
function resolve(obj: TranslationKeys, key: string): string {
  const parts = key.split('.')
  let current: any = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return key
    current = current[part]
  }
  return typeof current === 'string' ? current : key
}

/**
 * Hook: returns a translation function for the active tenant locale.
 *
 * @example
 * const t = useT()
 * <button>{t('common.save')}</button>
 */
export function useT() {
  const { locale } = useTenant()
  const translations = LOCALES[locale] ?? fr

  return (key: FlatKey, fallback?: string): string => {
    const value = resolve(translations, key)
    return value !== key ? value : (fallback ?? key)
  }
}

/**
 * Server-side translation (pass locale explicitly).
 * Use in Server Components where useTenant() isn't available.
 */
export function createT(locale: Locale) {
  const translations = LOCALES[locale] ?? fr
  return (key: string, fallback?: string): string => {
    const value = resolve(translations, key)
    return value !== key ? value : (fallback ?? key)
  }
}
