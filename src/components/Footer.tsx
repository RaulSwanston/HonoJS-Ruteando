import type { TranslationKey } from '../lib/engine'

type Props = {
  t: (key: TranslationKey) => string
}

export default function Footer({ t }: Props) {
  return (
    <footer>
      <p>&copy; {new Date().getFullYear()} {t('app_name')}</p>
    </footer>
  )
}
