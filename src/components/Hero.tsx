import type { TranslationKey } from '../lib/engine'

type Props = {
  t: (key: TranslationKey, ...args: string[]) => string
}

export default function Hero({ t }: Props) {
  return (
    <section>
      <h1>{t('home_welcome')}</h1>
      <p>{t('tagline')}</p>
    </section>
  )
}
