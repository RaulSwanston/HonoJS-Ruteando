import { Hono } from 'hono'
import type { Variables } from '../lib/engine'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const router = new Hono<{ Variables: Variables }>()

router.get('/about', (c) => {
  const t = c.get('t')

  return c.render(
    <div>
      <Navbar t={t} />
      <main>
        <h1>{t('about_title')}</h1>
      </main>
      <Footer t={t} />
    </div>,
    { title: t('about_title') }
  )
})

export default router
