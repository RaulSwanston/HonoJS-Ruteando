import type { KVNamespace } from '@cloudflare/workers-types'

const RESET_TTL = 3_600 // 1 hour

export async function createResetToken(kv: KVNamespace, userId: string): Promise<string> {
  const token = crypto.randomUUID()
  await kv.put(`reset:${token}`, userId, { expirationTtl: RESET_TTL })
  return token
}

export async function verifyResetToken(kv: KVNamespace, token: string): Promise<string | null> {
  const userId = await kv.get(`reset:${token}`)
  if (!userId) return null
  await kv.delete(`reset:${token}`)
  return userId
}
