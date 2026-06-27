import { Hono } from 'hono'
import { renderer } from './renderer'
import { getConfig, getLanguage, t, type Variables } from './lib/engine'
import { sessionMiddleware } from './middleware/auth'
import home from './routes/index'
import about from './routes/about'
import register from './routes/auth/register'
import login from './routes/auth/login'
import logout from './routes/auth/logout'

type Bindings = {
  DB: D1Database
  SESSION_KV: KVNamespace
  SESSION_SECRET: string
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.use('*', async (c, next) => {
  const config = getConfig()
  const lang = getLanguage(c.req.header('accept-language'))

  c.set('config', config)
  c.set('lang', lang)
  c.set('t', (key) => t(key, lang))

  await next()
})

app.use('*', (c, next) => sessionMiddleware(c.env.SESSION_KV, c.env.SESSION_SECRET, c.env.DB)(c, next))

app.use(renderer)

app.route('/', home)
app.route('/', about)
app.route('/auth', register)
app.route('/auth', login)
app.route('/auth', logout)

export default app
