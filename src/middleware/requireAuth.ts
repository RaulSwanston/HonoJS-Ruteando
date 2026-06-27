import type { MiddlewareHandler } from 'hono'

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const user = (c as any).get('user')
  if (!user) {
    return c.redirect('/auth/login')
  }
  await next()
}
