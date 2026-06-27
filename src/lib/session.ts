import type { KVNamespace } from '@cloudflare/workers-types'

export interface Session {
  userId: string
  role: string
  csrfToken: string
  createdAt: string
}

const SESSION_TTL = 604_800 // 7 days
const COOKIE_NAME = 'session_id'

function textEncode(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

function textDecode(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes)
}

async function sign(key: CryptoKey, data: string): Promise<string> {
  const sig = await crypto.subtle.sign('HMAC', key, textEncode(data))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

async function getSigningKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', textEncode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

function cookieValue(sessionId: string, signature: string): string {
  return `${sessionId}.${signature}`
}

function parseCookie(raw: string): { sessionId: string; signature: string } | null {
  const dot = raw.indexOf('.')
  if (dot === -1) return null
  return { sessionId: raw.slice(0, dot), signature: raw.slice(dot + 1) }
}

export async function createSession(
  kv: KVNamespace,
  secret: string,
  userId: string,
  role: string
): Promise<string> {
  const sessionId = crypto.randomUUID()

  const session: Session = {
    userId,
    role,
    csrfToken: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }

  await kv.put(`session:${sessionId}`, JSON.stringify(session), { expirationTtl: SESSION_TTL })

  const key = await getSigningKey(secret)
  const sig = await sign(key, sessionId)

  return cookieValue(sessionId, sig)
}

export async function getSession(
  kv: KVNamespace,
  secret: string,
  rawCookie: string | undefined
): Promise<{ session: Session; sessionId: string } | null> {
  if (!rawCookie) return null

  const parsed = parseCookie(rawCookie)
  if (!parsed) return null

  const key = await getSigningKey(secret)
  const expectedSig = await sign(key, parsed.sessionId)

  if (parsed.signature !== expectedSig) return null

  const raw = await kv.get(`session:${parsed.sessionId}`)
  if (!raw) return null

  return { session: JSON.parse(raw) as Session, sessionId: parsed.sessionId }
}

export async function destroySession(kv: KVNamespace, sessionId: string): Promise<void> {
  await kv.delete(`session:${sessionId}`)
}

export function setCookieHeader(sessionId: string): string {
  return `${COOKIE_NAME}=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL}`
}

export function clearCookieHeader(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
}
