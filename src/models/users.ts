import type { D1Database } from '@cloudflare/workers-types'

export type UserRole = 'super_admin' | 'user'

export interface User {
  id: string
  email: string
  name: string
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CreateUserInput {
  id: string
  email: string
  name: string
  avatar_url?: string
}

export async function getUserById(db: D1Database, id: string): Promise<User | null> {
  return (await db
    .prepare('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL')
    .bind(id)
    .first()) as User | null
}

export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  return (await db
    .prepare('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL')
    .bind(email)
    .first()) as User | null
}

export async function createUser(db: D1Database, input: CreateUserInput): Promise<User> {
  await db
    .prepare(
      `INSERT INTO users (id, email, name, avatar_url)
       VALUES (?, ?, ?, ?)`
    )
    .bind(input.id, input.email, input.name, input.avatar_url ?? null)
    .run()

  return (await getUserById(db, input.id))!
}

export async function updateUser(
  db: D1Database,
  id: string,
  data: Partial<Pick<User, 'name' | 'avatar_url' | 'role'>>
): Promise<User | null> {
  const sets: string[] = []
  const values: unknown[] = []

  if (data.name !== undefined) { sets.push('name = ?'); values.push(data.name) }
  if (data.avatar_url !== undefined) { sets.push('avatar_url = ?'); values.push(data.avatar_url) }
  if (data.role !== undefined) { sets.push('role = ?'); values.push(data.role) }

  if (sets.length === 0) return getUserById(db, id)

  sets.push("updated_at = datetime('now')")
  values.push(id)

  await db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).bind(...values).run()

  return getUserById(db, id)
}

export async function softDeleteUser(db: D1Database, id: string): Promise<void> {
  await db
    .prepare("UPDATE users SET deleted_at = datetime('now'), updated_at = datetime('now') WHERE id = ?")
    .bind(id)
    .run()
}

export async function setPasswordHash(db: D1Database, id: string, hash: string): Promise<void> {
  await db
    .prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(hash, id)
    .run()
}

export async function listUsersByBusiness(db: D1Database, businessId: string): Promise<User[]> {
  return (await db
    .prepare(
      `SELECT u.* FROM users u
       INNER JOIN business_members bm ON bm.user_id = u.id
       WHERE bm.business_id = ? AND u.deleted_at IS NULL
       ORDER BY u.name`
    )
    .bind(businessId)
    .all()).results as User[]
}
