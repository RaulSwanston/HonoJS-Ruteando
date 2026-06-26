import { jsxRenderer } from 'hono/jsx-renderer'
import type { Language, TranslationKey } from './lib/engine'

type RendererProps = {
  title?: string
  description?: string
  children?: any
}

export const renderer = jsxRenderer(({ title, description, children }: RendererProps, c) => {
  const t = c.get('t') as (key: TranslationKey) => string
  const lang = c.get('lang') as Language

  return (
    <html lang={lang}>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={description ?? t('tagline')} />
        <title>{title ? `${title} | ${t('app_name')}` : t('app_name')}</title>
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
})
