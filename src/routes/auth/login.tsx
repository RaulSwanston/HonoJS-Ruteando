import { Hono } from 'hono'
import type { Variables } from '../../lib/engine'
import { createSession, setCookieHeader } from '../../lib/session'
import { verifyPassword } from '../../lib/crypto'
import { getUserByEmail } from '../../models/users'

type AuthBindings = {
  DB: D1Database
  SESSION_KV: KVNamespace
  SESSION_SECRET: string
}

const router = new Hono<{ Bindings: AuthBindings; Variables: Variables }>()

router.get('/login', (c) => {
  const t = c.get('t')

  if (c.get('user')) {
    return c.redirect('/')
  }

  return c.render(
    <div>
      <h1>{t('login_title')}</h1>

      <form method="POST" action="/auth/login" novalidate>
        <div>
          <label for="email">{t('email')}</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div>
          <label for="password">{t('password')}</label>
          <input type="password" id="password" name="password" required />
        </div>
        <button type="submit">{t('login')}</button>
        <p><a href="/auth/forgot-password">{t('forgot_password')}</a></p>
      </form>

      <hr />

      <p>{t('or_continue_with')}</p>
      <a href="/auth/google">{t('login_google')}</a>
      <a href="/auth/github">{t('login_github')}</a>
      <a href="/auth/apple">{t('login_apple')}</a>

      <p>
        {t('no_account')} <a href="/auth/register">{t('register')}</a>
      </p>
    </div>,
    { title: t('login_title') }
  )
})

router.post('/login', async (c) => {
  const t = c.get('t')
  const body = await c.req.parseBody()
  const email = (body.email as string)?.trim().toLowerCase()
  const password = body.password as string

  if (!email || !password) {
    return c.render(
      <div>
        <p style="color:red">{t('all_fields_required')}</p>
        <a href="/auth/login">{t('go_back')}</a>
      </div>,
      { title: t('login_error') }
    )
  }

  const user = await getUserByEmail(c.env.DB, email)
  if (!user || !user.password_hash) {
    return c.render(
      <div>
        <p style="color:red">{t('invalid_credentials')}</p>
        <a href="/auth/login">{t('go_back')}</a>
      </div>,
      { title: t('login_error') }
    )
  }

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) {
    return c.render(
      <div>
        <p style="color:red">{t('invalid_credentials')}</p>
        <a href="/auth/login">{t('go_back')}</a>
      </div>,
      { title: t('login_error') }
    )
  }

  const cookie = await createSession(c.env.SESSION_KV, c.env.SESSION_SECRET, user.id, user.role)
  c.header('Set-Cookie', setCookieHeader(cookie))
  return c.redirect('/')
})

export default router
