import { Hono } from 'hono'
import type { Variables } from '../../lib/engine'
import { createSession, setCookieHeader } from '../../lib/session'
import { verifyPassword } from '../../lib/crypto'
import { getUserByEmail } from '../../models/users'
import { rateLimit, resetRateLimit, getClientIp } from '../../middleware/rateLimit'
import { firebaseConfig } from '../../lib/firebase'

type AuthBindings = {
  DB: D1Database
  SESSION_KV: KVNamespace
  SESSION_SECRET: string
}

const router = new Hono<{ Bindings: AuthBindings; Variables: Variables }>()

router.get('/login', (c) => {
  const t = c.get('t')

  if (c.get('user')) {
    return c.redirect('/dashboard')
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
        <button type="submit" id="submit-btn">{t('login')}</button>
        <p><a href="/auth/forgot-password">{t('forgot_password')}</a></p>
      </form>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('submit-btn')?.addEventListener('click', function() {
            this.disabled = true;
            this.textContent = '${t('processing')}';
          });
        `
      }} />

      <hr />

      <p>{t('or_continue_with')}</p>
      <button id="btn-google" class="oauth-btn">{t('login_google')}</button>
      <button id="btn-apple" class="oauth-btn">{t('login_apple')}</button>

      <p id="oauth-error" style="color:red;display:none"></p>

      <script type="module" dangerouslySetInnerHTML={{
        __html: `
          import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js"
          import { getAuth, signInWithPopup, GoogleAuthProvider, OAuthProvider } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js"

          const app = initializeApp(${JSON.stringify(firebaseConfig)})
          const auth = getAuth(app)

          const errorEl = document.getElementById('oauth-error')

          async function handleOAuth(provider) {
            errorEl.style.display = 'none'
            try {
              const result = await signInWithPopup(auth, provider)
              const idToken = await result.user.getIdToken()
              const form = document.createElement('form')
              form.method = 'POST'
              form.action = '/auth/firebase'
              const input = document.createElement('input')
              input.type = 'hidden'
              input.name = 'idToken'
              input.value = idToken
              form.appendChild(input)
              document.body.appendChild(form)
              form.submit()
            } catch (err) {
              if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return
              errorEl.textContent = err.message
              errorEl.style.display = 'block'
            }
          }

          document.getElementById('btn-google')?.addEventListener('click', () => handleOAuth(new GoogleAuthProvider()))
          document.getElementById('btn-apple')?.addEventListener('click', () => handleOAuth(new OAuthProvider('apple.com')))
        `
      }} />

      <p>
        {t('no_account')} <a href="/auth/register">{t('register')}</a>
      </p>
      <p><a href="/">{t('back_to_home')}</a></p>
    </div>,
    { title: t('login_title') }
  )
})

router.post('/login', rateLimit('login'), async (c) => {
  const t = c.get('t')
  const ip = getClientIp(c)
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

  await resetRateLimit(c.env.SESSION_KV, 'login', ip)
  const cookie = await createSession(c.env.SESSION_KV, c.env.SESSION_SECRET, user.id, user.role)
  c.header('Set-Cookie', setCookieHeader(cookie))
  return c.redirect('/dashboard')
})

export default router
