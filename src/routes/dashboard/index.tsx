import { Hono } from 'hono'
import type { Variables } from '../../lib/engine'
import { requireAuth } from '../../middleware/requireAuth'
import DashboardLayout from '../../components/DashboardLayout'

const router = new Hono<{ Variables: Variables }>()

router.get('/dashboard', requireAuth, (c) => {
  const t = c.get('t')
  const user = c.get('user')!

  return c.render(
    <DashboardLayout t={t} user={user} title={t('dashboard_overview')}>
      <div class="dashboard-welcome">
        <p>{t('dashboard_welcome', user.name)}</p>
      </div>
    </DashboardLayout>,
    { title: t('dashboard_overview') }
  )
})

export default router
