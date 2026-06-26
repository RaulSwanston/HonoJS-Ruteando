import { Hono } from 'hono'
import type { Variables } from '../lib/engine'

const router = new Hono<{ Variables: Variables }>()

router.get('/about', (c) => {
  const t = c.get('t')

  return c.render(
    <main>
      <h1>{t('about_title')}</h1>
    </main>,
    { title: t('about_title') }
  )
})

export default router
