import { Hono } from 'hono'
import type { Variables } from '../../lib/engine'
import { verifyFirebaseIdToken } from '../../lib/firebase'
import { createSession, setCookieHeader } from '../../lib/session'
import { getUserByEmail, createUser, updateUser } from '../../models/users'

type AuthBindings = {
  DB: D1Database
  SESSION_KV: KVNamespace
  SESSION_SECRET: string
}

const router = new Hono<{ Bindings: AuthBindings; Variables: Variables }>()

router.post('/firebase', async (c) => {
  const t = c.get('t')
  const body = await c.req.parseBody()
  const idToken = body.idToken as string

  if (!idToken) {
    return c.json({ error: t('all_fields_required') }, 400)
  }

  let firebaseUser
  try {
    firebaseUser = await verifyFirebaseIdToken(idToken)
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }

  let user = await getUserByEmail(c.env.DB, firebaseUser.email ?? '')

  if (user) {
    user = await updateUser(c.env.DB, user.id, {
      name: firebaseUser.name ?? user.name,
      avatar_url: firebaseUser.picture,
    })
  } else {
    user = await createUser(c.env.DB, {
      id: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      name: firebaseUser.name ?? 'User',
      avatar_url: firebaseUser.picture,
    })
  }

  if (!user) {
    return c.json({ error: 'Failed to create user' }, 500)
  }

  const cookie = await createSession(c.env.SESSION_KV, c.env.SESSION_SECRET, user.id, user.role)
  c.header('Set-Cookie', setCookieHeader(cookie))
  return c.redirect('/dashboard')
})

export default router
