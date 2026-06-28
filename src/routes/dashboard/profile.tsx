import { Hono } from 'hono'
import type { Variables } from '../../lib/engine'
import { requireAuth } from '../../middleware/requireAuth'
import { updateUser } from '../../models/users'
import DashboardLayout from '../../components/DashboardLayout'

const router = new Hono<{ Bindings: { DB: D1Database }; Variables: Variables }>()

router.get('/dashboard/profile', requireAuth, (c) => {
  const t = c.get('t')
  const user = c.get('user')!

  return c.render(
    <DashboardLayout t={t} user={user} title={t('dashboard_profile')}>
      <form method="POST" action="/dashboard/profile" novalidate>
        <div>
          <label for="name">{t('name')}</label>
          <input type="text" id="name" name="name" value={user.name} required minlength={2} />
        </div>
        <div>
          <label for="email">{t('email')}</label>
          <input type="email" id="email" value={user.email} disabled />
          <small>{t('email_cannot_change')}</small>
        </div>
        <div>
          <label for="avatar_url">{t('avatar_url')}</label>
          <input type="url" id="avatar_url" name="avatar_url" value={user.avatar_url ?? ''} placeholder="https://..." />
        </div>
        <button type="submit">{t('save_changes')}</button>
      </form>
    </DashboardLayout>,
    { title: t('dashboard_profile') }
  )
})

router.post('/dashboard/profile', requireAuth, async (c) => {
  const t = c.get('t')
  const user = c.get('user')!
  const body = await c.req.parseBody()
  const name = (body.name as string)?.trim()
  const avatar_url = (body.avatar_url as string)?.trim() || null

  if (!name) {
    return c.render(
      <DashboardLayout t={t} user={user} title={t('dashboard_profile')}>
        <p style="color:red">{t('all_fields_required')}</p>
        <a href="/dashboard/profile">{t('go_back')}</a>
      </DashboardLayout>,
      { title: t('dashboard_profile') }
    )
  }

  await updateUser(c.env.DB, user.id, { name, avatar_url })

  return c.redirect('/dashboard/profile')
})

export default router
