import { Hono } from 'hono'
import type { Variables } from '../../lib/engine'
import { destroySession, clearCookieHeader } from '../../lib/session'

type AuthBindings = {
  SESSION_KV: KVNamespace
}

const router = new Hono<{ Bindings: AuthBindings; Variables: Variables }>()

router.get('/logout', async (c) => {
  const sessionId = c.get('sessionId')
  if (sessionId) {
    await destroySession(c.env.SESSION_KV, sessionId)
  }
  c.header('Set-Cookie', clearCookieHeader())
  return c.redirect('/auth/login')
})

export default router
