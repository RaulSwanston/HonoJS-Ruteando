import { Hono } from 'hono'
import type { Variables } from '../lib/engine'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Footer from '../components/Footer'

const router = new Hono<{ Variables: Variables }>()

router.get('/', (c) => {
  const t = c.get('t')

  return c.render(
    <div>
      <Navbar t={t} />
      <Hero t={t} />
      <Footer t={t} />
    </div>,
    { title: t('home_title') }
  )
})

export default router
