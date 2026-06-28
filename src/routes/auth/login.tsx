import { Hono } from 'hono'
import type { Variables } from '../../lib/engine'
import { firebaseConfig } from '../../lib/firebase'

const router = new Hono<{ Variables: Variables }>()

router.get('/login', (c) => {
  const t = c.get('t')

  if (c.get('user')) {
    return c.redirect('/dashboard')
  }

  return c.render(
    <div>
      <h1>{t('login_title')}</h1>

      <p id="login-error" style="color:red;display:none"></p>

      <form id="login-form" novalidate>
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

      <hr />

      <p>{t('or_continue_with')}</p>
      <button id="btn-google" class="oauth-btn">{t('login_google')}</button>
      <button id="btn-apple" class="oauth-btn">{t('login_apple')}</button>

      <p id="oauth-error" style="color:red;display:none"></p>

      <script type="module" dangerouslySetInnerHTML={{
        __html: `
          import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js"
          import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, OAuthProvider } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js"

          const app = initializeApp(${JSON.stringify(firebaseConfig)})
          const auth = getAuth(app)

          const form = document.getElementById('login-form')
          const submitBtn = document.getElementById('submit-btn')
          const errorEl = document.getElementById('login-error')

          form.addEventListener('submit', async (e) => {
            const email = document.getElementById('email').value.trim()
            const password = document.getElementById('password').value
            if (!email || !password) return

            e.preventDefault()
            errorEl.style.display = 'none'
            submitBtn.disabled = true
            submitBtn.textContent = '${t('processing')}'

            try {
              const result = await signInWithEmailAndPassword(auth, email, password)
              const idToken = await result.user.getIdToken()
              const redirectForm = document.createElement('form')
              redirectForm.method = 'POST'
              redirectForm.action = '/auth/firebase'
              const input = document.createElement('input')
              input.type = 'hidden'
              input.name = 'idToken'
              input.value = idToken
              redirectForm.appendChild(input)
              document.body.appendChild(redirectForm)
              redirectForm.submit()
            } catch (err) {
              errorEl.textContent = '${t('invalid_credentials')}'
              errorEl.style.display = 'block'
              submitBtn.disabled = false
              submitBtn.textContent = '${t('login')}'
            }
          })

          const oauthErrorEl = document.getElementById('oauth-error')

          async function handleOAuth(provider) {
            oauthErrorEl.style.display = 'none'
            try {
              const result = await signInWithPopup(auth, provider)
              const idToken = await result.user.getIdToken()
              const redirectForm = document.createElement('form')
              redirectForm.method = 'POST'
              redirectForm.action = '/auth/firebase'
              const input = document.createElement('input')
              input.type = 'hidden'
              input.name = 'idToken'
              input.value = idToken
              redirectForm.appendChild(input)
              document.body.appendChild(redirectForm)
              redirectForm.submit()
            } catch (err) {
              if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return
              oauthErrorEl.textContent = err.message
              oauthErrorEl.style.display = 'block'
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

router.post('/login', (c) => {
  return c.redirect('/auth/login')
})

export default router
