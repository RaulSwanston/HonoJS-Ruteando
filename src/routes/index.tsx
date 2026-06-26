import { Hono } from 'hono'
import type { Variables } from '../lib/engine'

const router = new Hono<{ Variables: Variables }>()

router.get('/', (c) => {
  const t = c.get('t')

  return c.render(
    <main>
      <h1>{t('home_welcome')}</h1>
      <p>{t('tagline')}</p>
    </main>,
    { title: t('home_title') }
  )
})

export default router
