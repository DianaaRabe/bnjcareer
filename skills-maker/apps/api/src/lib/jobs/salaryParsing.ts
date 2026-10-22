import { SALARY_PERIOD, type NormalizedSalary, type SalaryPeriod } from './types.js'

// Sources publish salaries as free text ("Mensuel de 1800.0 Euros à 2200.0 Euros sur 12.0 mois").
// We keep the label verbatim and extract structured values on a best-effort basis — the client
// falls back to the label whenever parsing yields nothing.

const PERIOD_PATTERNS: { pattern: RegExp; period: SalaryPeriod }[] = [
  { pattern: /horaire|per hour|\/\s?h(?:our|eure)?\b|de l'heure/i, period: SALARY_PERIOD.hour },
  { pattern: /mensuel|per month|par mois|\/\s?mois|monthly/i, period: SALARY_PERIOD.month },
  { pattern: /annuel|per year|par an|\/\s?an\b|yearly|annually/i, period: SALARY_PERIOD.year },
]

const CURRENCY_PATTERNS: { pattern: RegExp; currency: string }[] = [
  { pattern: /€|euros?\b|\bEUR\b/i, currency: 'EUR' },
  { pattern: /\$|dollars?\b|\bUSD\b/i, currency: 'USD' },
  { pattern: /£|pounds?\b|\bGBP\b/i, currency: 'GBP' },
  { pattern: /\bCHF\b|francs?\b/i, currency: 'CHF' },
  { pattern: /\bCAD\b/i, currency: 'CAD' },
]

/** "1 800,50" · "1,800.50" · "3,000" · "1800.0" → 1800.5 / 1800.5 / 3000 / 1800 */
function toNumber(raw: string): number | null {
  const compact = raw.replace(/\s/g, '')
  const lastComma = compact.lastIndexOf(',')
  const lastDot = compact.lastIndexOf('.')

  let normalized: string
  if (lastComma >= 0 && lastDot >= 0) {
    // Whichever comes last is the decimal separator.
    normalized =
      lastComma > lastDot
        ? compact.replace(/\./g, '').replace(',', '.')
        : compact.replace(/,/g, '')
  } else if (lastComma >= 0) {
    // A comma followed by exactly three digits is a thousands separator.
    normalized = /,\d{3}(?!\d)/.test(compact) ? compact.replace(/,/g, '') : compact.replace(',', '.')
  } else {
    normalized = compact
  }

  const value = Number(normalized)
  return Number.isFinite(value) ? value : null
}

export function parseSalary(rawLabel: string | null | undefined): NormalizedSalary | null {
  const label = rawLabel?.trim()
  if (!label) return null

  // "sur 12.0 mois" counts payments per year, it is not an amount.
  const withoutInstalments = label.replace(/\bsur\s+[\d.,\s]+mois\b/gi, ' ')

  const amounts = [...withoutInstalments.matchAll(/\d[\d\s.,]*\d|\d/g)]
    .map((match) => toNumber(match[0]))
    .filter((value): value is number => value !== null && value > 0)

  const period = PERIOD_PATTERNS.find(({ pattern }) => pattern.test(label))?.period ?? null
  const currency = CURRENCY_PATTERNS.find(({ pattern }) => pattern.test(label))?.currency ?? null

  const [min = null, max = null] = amounts
  return {
    label,
    min,
    max: max !== null && max !== min ? max : null,
    currency,
    period,
  }
}
