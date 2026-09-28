import { useIntl } from 'react-intl'

/** Shorthand for translating into plain strings (attributes, aria-labels, placeholders). */
export const useTranslate = () => {
  const intl = useIntl()

  const translate = (id?: string, values?: Record<string, string | number>) => {
    if (!id) {
      return ''
    }
    return intl.formatMessage({ id }, values)
  }

  return { translate }
}
