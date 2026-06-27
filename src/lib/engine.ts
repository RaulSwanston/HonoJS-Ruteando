import es from '../i18n/es.json'
import en from '../i18n/en.json'
import configData from '../config.json'

export type Config = typeof configData
export type Language = 'es' | 'en'
export type TranslationKey = keyof typeof es

export type Variables = {
  config: Config
  lang: Language
  t: (key: TranslationKey) => string
  user: import('../models/users').User | null
  sessionId: string | null
  csrfToken: string
}

const translations: Record<Language, Record<string, string>> = { es, en }

export const getConfig = (): Config => configData

export const getLanguage = (acceptLanguage?: string): Language => {
  if (acceptLanguage?.startsWith('en')) return 'en'
  return configData.defaultLang as Language
}

export const t = (key: TranslationKey, lang: Language): string =>
  translations[lang]?.[key] ?? key
