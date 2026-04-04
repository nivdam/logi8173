import he from "./he.json"
import en from "./en.json"

const locales = { he, en } as const

const DEFAULT_LOCALE = "he"

const getNestedValue = (object: Record<string, unknown>, path: string): string => {
  const result = path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, object)

  if (typeof result === "string") return result
  return path
}

export const createTranslator = (locale: Locale = DEFAULT_LOCALE) => {
  const messages = locales[locale]
  return (key: string): string => getNestedValue(messages as unknown as Record<string, unknown>, key)
}

export const t = createTranslator(DEFAULT_LOCALE)

type Locale = keyof typeof locales

export type { Locale }
