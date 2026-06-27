import type { MiddlewareHandler } from 'hono'
import { getSession } from '../lib/session'
import { getUserById } from '../models/users'

export const sessionMiddleware = (
  kv: KVNamespace,
  secret: string,
  db: D1Database
): MiddlewareHandler => {
  return async (c, next) => {
    const rawCookie = c.req.header('cookie')
    const sessionCookie = rawCookie
      ?.split(';')
      .map(s => s.trim())
      .find(s => s.startsWith('session_id='))
      ?.slice(11)

    const result = sessionCookie ? await getSession(kv, secret, sessionCookie) : null

    if (result) {
      const user = await getUserById(db, result.session.userId)
      ;(c as any).set('user', user)
      ;(c as any).set('sessionId', result.sessionId)
      ;(c as any).set('csrfToken', result.session.csrfToken)
    } else {
      ;(c as any).set('user', null)
      ;(c as any).set('sessionId', null)
      ;(c as any).set('csrfToken', '')
    }

    await next()
  }
}
