const ITERATIONS = 100_000
const KEY_LENGTH = 256
const SALT_LENGTH = 16

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function fromBase64(str: string): Uint8Array {
  const binary = atob(str)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function textEncode(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

async function deriveBits(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey('raw', textEncode(password), 'PBKDF2', false, ['deriveBits'])

  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    KEY_LENGTH
  )

  return new Uint8Array(bits)
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const hash = await deriveBits(password, salt, ITERATIONS)
  return `$pbkdf2-sha256$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 5 || parts[1] !== 'pbkdf2-sha256') return false

  const iterations = parseInt(parts[2], 10)
  if (isNaN(iterations) || iterations <= 0) return false

  const salt = fromBase64(parts[3])
  const storedHash = fromBase64(parts[4])

  const hash = await deriveBits(password, salt, iterations)

  if (hash.length !== storedHash.length) return false

  let cmp = 0
  for (let i = 0; i < hash.length; i++) cmp |= hash[i] ^ storedHash[i]
  return cmp === 0
}
