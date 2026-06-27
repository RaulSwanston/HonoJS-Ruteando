import { Hono } from 'hono'
import type { Variables } from '../../lib/engine'
import { createResetToken } from '../../lib/reset-token'
import { getUserByEmail } from '../../models/users'

type AuthBindings = {
  DB: D1Database
  SESSION_KV: KVNamespace
}

const router = new Hono<{ Bindings: AuthBindings; Variables: Variables }>()

router.get('/forgot-password', (c) => {
  const t = c.get('t')

  return c.render(
    <div>
      <h1>{t('forgot_password')}</h1>
      <form method="POST" action="/auth/forgot-password" novalidate>
        <div>
          <label for="email">{t('email')}</label>
          <input type="email" id="email" name="email" required />
        </div>
        <button type="submit">{t('send_reset_link')}</button>
      </form>
      <p>
        <a href="/auth/login">{t('back_to_login')}</a>
      </p>
    </div>,
    { title: t('forgot_password') }
  )
})

router.post('/forgot-password', async (c) => {
  const t = c.get('t')
  const body = await c.req.parseBody()
  const email = (body.email as string)?.trim().toLowerCase()

  if (!email) {
    return c.render(
      <div>
        <p style="color:red">{t('all_fields_required')}</p>
        <a href="/auth/forgot-password">{t('go_back')}</a>
      </div>,
      { title: t('forgot_password') }
    )
  }

  const user = await getUserByEmail(c.env.DB, email)
  if (user) {
    const token = await createResetToken(c.env.SESSION_KV, user.id)
    const resetUrl = `${new URL(c.req.url).origin}/auth/reset-password?token=${token}`

    return c.render(
      <div>
        <h1>{t('reset_link_sent')}</h1>
        <p style="background:#f0f0f0;padding:1em;word-break:break-all">{resetUrl}</p>
        <p>{t('debug_mode_hint')}</p>
        <a href="/auth/login">{t('back_to_login')}</a>
      </div>,
      { title: t('reset_link_sent') }
    )
  }

  return c.render(
    <div>
      <p>{t('check_email_reset')}</p>
      <a href="/auth/login">{t('back_to_login')}</a>
    </div>,
    { title: t('forgot_password') }
  )
})

export default router
