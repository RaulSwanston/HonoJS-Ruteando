export const firebaseConfig = {
  apiKey: "AIzaSyBvn_s1WosOfK2B5at2TCk0TqfD7m83xFo",
  authDomain: "zonab2b.firebaseapp.com",
  projectId: "zonab2b",
  storageBucket: "zonab2b.firebasestorage.app",
  messagingSenderId: "377496586665",
  appId: "1:377496586665:web:be542dd8344027f445dcb8",
}

function base64urlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return Uint8Array.from(atob(str), c => c.charCodeAt(0))
}

let cachedKeys: { keys: any[]; fetchedAt: number } | null = null

async function getPublicKeys(): Promise<any[]> {
  const now = Date.now()
  if (cachedKeys && now - cachedKeys.fetchedAt < 3_600_000) {
    return cachedKeys.keys
  }
  const resp = await fetch(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
  )
  const body = await resp.json() as { keys: any[] }
  cachedKeys = { keys: body.keys, fetchedAt: now }
  return body.keys
}

export interface FirebaseUser {
  uid: string
  email: string | null
  email_verified: boolean
  name: string | null
  picture: string | null
  sign_in_provider: string
}

export async function verifyFirebaseIdToken(idToken: string): Promise<FirebaseUser> {
  const projectId = firebaseConfig.projectId
  const parts = idToken.split('.')
  if (parts.length !== 3) throw new Error('Invalid JWT format')

  const header = JSON.parse(atob(parts[0]))
  const payload = JSON.parse(atob(parts[1]))

  if (header.alg !== 'RS256') throw new Error('Invalid algorithm')

  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    throw new Error('Invalid issuer')
  }

  if (payload.aud !== projectId) throw new Error('Invalid audience')

  if (payload.exp * 1000 < Date.now()) throw new Error('Token expired')

  const keys = await getPublicKeys()
  const key = keys.find(k => k.kid === header.kid)
  if (!key) throw new Error('Unknown signing key')

  const publicKey = await crypto.subtle.importKey(
    'jwk',
    { kty: key.kty, n: key.n, e: key.e, alg: 'RS256' },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  )

  const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  const sig = base64urlDecode(parts[2])

  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', publicKey, sig, data)
  if (!valid) throw new Error('Invalid signature')

  return {
    uid: payload.sub,
    email: payload.email ?? null,
    email_verified: payload.email_verified ?? false,
    name: payload.name ?? null,
    picture: payload.picture ?? null,
    sign_in_provider: payload.firebase?.sign_in_provider ?? 'unknown',
  }
}
