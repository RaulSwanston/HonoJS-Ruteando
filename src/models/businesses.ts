import type { D1Database } from '@cloudflare/workers-types'
import type { User } from './users'

export type BusinessRole = 'admin' | 'staff' | 'consumer'

export interface Business {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  config: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface BusinessMember {
  business_id: string
  user_id: string
  role: BusinessRole
  created_at: string
}

export interface CreateBusinessInput {
  id: string
  owner_id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
}

export async function getBusinessById(db: D1Database, id: string): Promise<Business | null> {
  return (await db
    .prepare('SELECT * FROM businesses WHERE id = ? AND deleted_at IS NULL')
    .bind(id)
    .first()) as Business | null
}

export async function getBusinessBySlug(db: D1Database, slug: string): Promise<Business | null> {
  return (await db
    .prepare('SELECT * FROM businesses WHERE slug = ? AND deleted_at IS NULL')
    .bind(slug)
    .first()) as Business | null
}

export async function createBusiness(db: D1Database, input: CreateBusinessInput): Promise<Business> {
  const result = await db
    .prepare(
      `INSERT INTO businesses (id, owner_id, name, slug, description, logo_url)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(input.id, input.owner_id, input.name, input.slug, input.description ?? null, input.logo_url ?? null)
    .run()

  if (!result.success) throw new Error('Failed to create business')

  const member = await addMember(db, input.id, input.owner_id, 'admin')
  if (!member) throw new Error('Failed to add owner as admin')

  return (await getBusinessById(db, input.id))!
}

export async function updateBusiness(
  db: D1Database,
  id: string,
  data: Partial<Pick<Business, 'name' | 'slug' | 'description' | 'logo_url' | 'config'>>
): Promise<Business | null> {
  const sets: string[] = []
  const values: unknown[] = []

  if (data.name !== undefined) { sets.push('name = ?'); values.push(data.name) }
  if (data.slug !== undefined) { sets.push('slug = ?'); values.push(data.slug) }
  if (data.description !== undefined) { sets.push('description = ?'); values.push(data.description) }
  if (data.logo_url !== undefined) { sets.push('logo_url = ?'); values.push(data.logo_url) }
  if (data.config !== undefined) { sets.push('config = ?'); values.push(data.config) }

  if (sets.length === 0) return getBusinessById(db, id)

  sets.push("updated_at = datetime('now')")
  values.push(id)

  await db.prepare(`UPDATE businesses SET ${sets.join(', ')} WHERE id = ?`).bind(...values).run()

  return getBusinessById(db, id)
}

export async function softDeleteBusiness(db: D1Database, id: string): Promise<void> {
  await db
    .prepare("UPDATE businesses SET deleted_at = datetime('now'), updated_at = datetime('now') WHERE id = ?")
    .bind(id)
    .run()
}

export async function getBusinessesByOwner(db: D1Database, ownerId: string): Promise<Business[]> {
  return (await db
    .prepare('SELECT * FROM businesses WHERE owner_id = ? AND deleted_at IS NULL ORDER BY name')
    .bind(ownerId)
    .all()).results as Business[]
}

export async function getBusinessesByMember(db: D1Database, userId: string): Promise<(Business & { role: string })[]> {
  return (await db
    .prepare(
      `SELECT b.*, bm.role FROM businesses b
       INNER JOIN business_members bm ON bm.business_id = b.id
       WHERE bm.user_id = ? AND b.deleted_at IS NULL
       ORDER BY b.name`
    )
    .bind(userId)
    .all()).results as (Business & { role: string })[]
}

export async function addMember(
  db: D1Database,
  businessId: string,
  userId: string,
  role: BusinessRole
): Promise<BusinessMember> {
  await db
    .prepare('INSERT OR IGNORE INTO business_members (business_id, user_id, role) VALUES (?, ?, ?)')
    .bind(businessId, userId, role)
    .run()

  return (await db
    .prepare('SELECT * FROM business_members WHERE business_id = ? AND user_id = ?')
    .bind(businessId, userId)
    .first()) as BusinessMember
}

export async function updateMemberRole(
  db: D1Database,
  businessId: string,
  userId: string,
  role: BusinessRole
): Promise<void> {
  await db
    .prepare('UPDATE business_members SET role = ? WHERE business_id = ? AND user_id = ?')
    .bind(role, businessId, userId)
    .run()
}

export async function removeMember(db: D1Database, businessId: string, userId: string): Promise<void> {
  await db
    .prepare('DELETE FROM business_members WHERE business_id = ? AND user_id = ?')
    .bind(businessId, userId)
    .run()
}

export async function getMemberRole(
  db: D1Database,
  businessId: string,
  userId: string
): Promise<BusinessRole | null> {
  const member = await db
    .prepare('SELECT role FROM business_members WHERE business_id = ? AND user_id = ?')
    .bind(businessId, userId)
    .first<{ role: BusinessRole }>()

  return member?.role ?? null
}
