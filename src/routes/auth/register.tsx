import { Hono } from 'hono'
import type { Variables } from '../../lib/engine'
import { createSession, setCookieHeader } from '../../lib/session'
import { hashPassword } from '../../lib/crypto'
import { getUserByEmail, createUser } from '../../models/users'

type AuthBindings = {
  DB: D1Database
  SESSION_KV: KVNamespace
  SESSION_SECRET: string
}

const router = new Hono<{ Bindings: AuthBindings; Variables: Variables }>()

router.get('/register', (c) => {
  const t = c.get('t')

  return c.render(
    <div>
      <h1>{t('register_title')}</h1>
      <form method="POST" action="/auth/register" novalidate>
        <div>
          <label for="name">{t('name')}</label>
          <input type="text" id="name" name="name" required minlength={2} />
        </div>
        <div>
          <label for="email">{t('email')}</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div>
          <label for="password">{t('password')}</label>
          <input type="password" id="password" name="password" required minlength={8} />
        </div>
        <button type="submit">{t('register')}</button>
      </form>
      <p>
        {t('already_have_account')} <a href="/auth/login">{t('login')}</a>
      </p>
      <p><a href="/">{t('back_to_home')}</a></p>
    </div>,
    { title: t('register_title') }
  )
})

router.post('/register', async (c) => {
  const t = c.get('t')
  const body = await c.req.parseBody()
  const name = (body.name as string)?.trim()
  const email = (body.email as string)?.trim().toLowerCase()
  const password = body.password as string

  if (!name || !email || !password) {
    return c.render(
      <div>
        <p style="color:red">{t('all_fields_required')}</p>
        <a href="/auth/register">{t('go_back')}</a>
      </div>,
      { title: t('register_error') }
    )
  }

  if (password.length < 8) {
    return c.render(
      <div>
        <p style="color:red">{t('password_too_short')}</p>
        <a href="/auth/register">{t('go_back')}</a>
      </div>,
      { title: t('register_error') }
    )
  }

  const existing = await getUserByEmail(c.env.DB, email)
  if (existing) {
    return c.render(
      <div>
        <p style="color:red">{t('email_exists')}</p>
        <a href="/auth/register">{t('go_back')}</a>
      </div>,
      { title: t('register_error') }
    )
  }

  const id = crypto.randomUUID()
  const passwordHash = await hashPassword(password)

  const user = await createUser(c.env.DB, { id, email, name, password_hash: passwordHash })
  const cookie = await createSession(c.env.SESSION_KV, c.env.SESSION_SECRET, user.id, user.role)

  c.header('Set-Cookie', setCookieHeader(cookie))
  return c.redirect('/')
})

export default router
