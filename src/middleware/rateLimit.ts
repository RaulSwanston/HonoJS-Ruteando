import type { MiddlewareHandler } from 'hono'

export function rateLimit(action: string, maxAttempts = 5, windowSeconds = 60): MiddlewareHandler {
  return async (c, next) => {
    const kv = c.env as { SESSION_KV: KVNamespace }
    const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'unknown'
    const key = `ratelimit:${ip}:${action}`

    const current = await kv.SESSION_KV.get(key)
    const count = current ? parseInt(current, 10) : 0

    if (count >= maxAttempts) {
      c.status(429)
      return c.render(
        <div>
          <h1>429 - Too Many Requests</h1>
          <p>Please wait before trying again.</p>
          <a href="/auth/login">Back to sign in</a>
        </div>,
        { title: 'Too Many Requests' }
      )
    }

    await kv.SESSION_KV.put(key, String(count + 1), { expirationTtl: windowSeconds })

    await next()
  }
}

export async function resetRateLimit(kv: KVNamespace, action: string, ip: string): Promise<void> {
  await kv.delete(`ratelimit:${ip}:${action}`)
}

export function getClientIp(c: { req: { header: (name: string) => string | undefined } }): string {
  return c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'unknown'
}
