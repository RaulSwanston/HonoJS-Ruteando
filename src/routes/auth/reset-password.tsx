import { Hono } from 'hono'
import type { Variables } from '../../lib/engine'
import { verifyResetToken } from '../../lib/reset-token'
import { hashPassword } from '../../lib/crypto'
import { getUserById, setPasswordHash } from '../../models/users'

type AuthBindings = {
  DB: D1Database
  SESSION_KV: KVNamespace
}

const router = new Hono<{ Bindings: AuthBindings; Variables: Variables }>()

router.get('/reset-password', async (c) => {
  const t = c.get('t')
  const token = c.req.query('token')

  if (!token) {
    return c.redirect('/auth/forgot-password')
  }

  return c.render(
    <div>
      <h1>{t('reset_password')}</h1>
      <form method="POST" action="/auth/reset-password" novalidate>
        <input type="hidden" name="token" value={token} />
        <div>
          <label for="password">{t('new_password')}</label>
          <input type="password" id="password" name="password" required minlength={8} />
        </div>
        <button type="submit">{t('update_password')}</button>
      </form>
    </div>,
    { title: t('reset_password') }
  )
})

router.post('/reset-password', async (c) => {
  const t = c.get('t')
  const body = await c.req.parseBody()
  const token = body.token as string
  const password = body.password as string

  if (!token || !password || password.length < 8) {
    return c.render(
      <div>
        <p style="color:red">{t('password_too_short')}</p>
        <a href={`/auth/reset-password?token=${token}`}>{t('go_back')}</a>
      </div>,
      { title: t('reset_password') }
    )
  }

  const userId = await verifyResetToken(c.env.SESSION_KV, token)
  if (!userId) {
    return c.render(
      <div>
        <p style="color:red">{t('invalid_reset_token')}</p>
        <a href="/auth/forgot-password">{t('forgot_password')}</a>
      </div>,
      { title: t('reset_password') }
    )
  }

  const user = await getUserById(c.env.DB, userId)
  if (!user) {
    return c.render(
      <div>
        <p style="color:red">{t('invalid_reset_token')}</p>
        <a href="/auth/forgot-password">{t('forgot_password')}</a>
      </div>,
      { title: t('reset_password') }
    )
  }

  const hash = await hashPassword(password)
  await setPasswordHash(c.env.DB, userId, hash)

  return c.render(
    <div>
      <h1>{t('password_updated')}</h1>
      <p>{t('password_updated_hint')}</p>
      <a href="/auth/login">{t('login')}</a>
    </div>,
    { title: t('password_updated') }
  )
})

export default router
