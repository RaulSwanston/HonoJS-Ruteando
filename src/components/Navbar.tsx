import type { TranslationKey } from '../lib/engine'

type Props = {
  t: (key: TranslationKey) => string
}

export default function Navbar({ t }: Props) {
  return (
    <nav>
      <a href="/">{t('app_name')}</a>
      <a href="/">{t('nav_inicio')}</a>
      <a href="/about">{t('nav_about')}</a>
      <a href="/contacto">{t('nav_contacto')}</a>
    </nav>
  )
}
