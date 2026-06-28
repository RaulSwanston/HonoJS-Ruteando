import { Hono } from 'hono'
import type { Variables } from '../../lib/engine'
import { firebaseConfig } from '../../lib/firebase'

const router = new Hono<{ Variables: Variables }>()

router.get('/register', (c) => {
  const t = c.get('t')

  return c.render(
    <div>
      <h1>{t('register_title')}</h1>

      <p id="register-error" style="color:red;display:none"></p>

      <form id="register-form" novalidate>
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
        <button type="submit" id="submit-btn">{t('register')}</button>
      </form>

      <hr />

      <p>{t('or_continue_with')}</p>
      <button id="btn-google" class="oauth-btn">{t('login_google')}</button>
      <button id="btn-apple" class="oauth-btn">{t('login_apple')}</button>

      <p id="oauth-error" style="color:red;display:none"></p>

      <script type="module" dangerouslySetInnerHTML={{
        __html: `
          import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js"
          import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, OAuthProvider } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js"

          const app = initializeApp(${JSON.stringify(firebaseConfig)})
          const auth = getAuth(app)

          const form = document.getElementById('register-form')
          const submitBtn = document.getElementById('submit-btn')
          const errorEl = document.getElementById('register-error')

          form.addEventListener('submit', async (e) => {
            e.preventDefault()
            errorEl.style.display = 'none'
            submitBtn.disabled = true
            submitBtn.textContent = '${t('processing')}'

            const name = document.getElementById('name').value.trim()
            const email = document.getElementById('email').value.trim()
            const password = document.getElementById('password').value

            if (!name || !email || !password) {
              errorEl.textContent = '${t('all_fields_required')}'
              errorEl.style.display = 'block'
              submitBtn.disabled = false
              submitBtn.textContent = '${t('register')}'
              return
            }

            if (password.length < 8) {
              errorEl.textContent = '${t('password_too_short')}'
              errorEl.style.display = 'block'
              submitBtn.disabled = false
              submitBtn.textContent = '${t('register')}'
              return
            }

            try {
              const result = await createUserWithEmailAndPassword(auth, email, password)
              await updateProfile(result.user, { displayName: name })
              const idToken = await result.user.getIdToken(true)

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
              if (err.code === 'auth/email-already-in-use') {
                errorEl.textContent = '${t('email_exists')}'
              } else if (err.code === 'auth/weak-password') {
                errorEl.textContent = '${t('password_too_short')}'
              } else {
                errorEl.textContent = err.message
              }
              errorEl.style.display = 'block'
              submitBtn.disabled = false
              submitBtn.textContent = '${t('register')}'
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
        {t('already_have_account')} <a href="/auth/login">{t('login')}</a>
      </p>
      <p><a href="/">{t('back_to_home')}</a></p>
    </div>,
    { title: t('register_title') }
  )
})

export default router
