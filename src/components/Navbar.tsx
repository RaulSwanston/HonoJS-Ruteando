import type { TranslationKey } from '../lib/engine'
import type { User } from '../models/users'

type Props = {
  t: (key: TranslationKey) => string
  user: User | null
}

export default function Navbar({ t, user }: Props) {
  return (
    <nav>
      <a href="/">{t('app_name')}</a>
      <a href="/">{t('nav_inicio')}</a>
      <a href="/about">{t('nav_about')}</a>
      <a href="/contacto">{t('nav_contacto')}</a>
      {user ? (
        <span>
          {user.name}
          <a href="/auth/logout">{t('logout')}</a>
        </span>
      ) : (
        <span>
          <a href="/auth/login">{t('login')}</a>
          <a href="/auth/register">{t('register')}</a>
        </span>
      )}
    </nav>
  )
}
