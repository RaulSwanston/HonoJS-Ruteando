import { Hono } from 'hono'
import { renderer } from './renderer'
import { getConfig, getLanguage, t, type Variables } from './lib/engine'
import home from './routes/index'
import about from './routes/about'

type Bindings = {}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.use('*', async (c, next) => {
  const config = getConfig()
  const lang = getLanguage(c.req.header('accept-language'))

  c.set('config', config)
  c.set('lang', lang)
  c.set('t', (key) => t(key, lang))

  await next()
})

app.use(renderer)

app.route('/', home)
app.route('/', about)

export default app
