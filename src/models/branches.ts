import type { D1Database } from '@cloudflare/workers-types'

export interface Branch {
  id: string
  business_id: string
  name: string
  address: string | null
  phone: string | null
  lat: number | null
  lng: number | null
  is_main: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CreateBranchInput {
  id: string
  business_id: string
  name: string
  address?: string
  phone?: string
  lat?: number
  lng?: number
  is_main?: boolean
}

export async function getBranchById(db: D1Database, id: string): Promise<Branch | null> {
  return (await db
    .prepare('SELECT * FROM branches WHERE id = ? AND deleted_at IS NULL')
    .bind(id)
    .first()) as Branch | null
}

export async function getBranchesByBusiness(db: D1Database, businessId: string): Promise<Branch[]> {
  return (await db
    .prepare('SELECT * FROM branches WHERE business_id = ? AND deleted_at IS NULL ORDER BY is_main DESC, name')
    .bind(businessId)
    .all()).results as Branch[]
}

export async function getMainBranch(db: D1Database, businessId: string): Promise<Branch | null> {
  return (await db
    .prepare('SELECT * FROM branches WHERE business_id = ? AND is_main = 1 AND deleted_at IS NULL LIMIT 1')
    .bind(businessId)
    .first()) as Branch | null
}

export async function createBranch(db: D1Database, input: CreateBranchInput): Promise<Branch> {
  if (input.is_main) {
    await db
      .prepare('UPDATE branches SET is_main = 0 WHERE business_id = ?')
      .bind(input.business_id)
      .run()
  }

  await db
    .prepare(
      `INSERT INTO branches (id, business_id, name, address, phone, lat, lng, is_main)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      input.id,
      input.business_id,
      input.name,
      input.address ?? null,
      input.phone ?? null,
      input.lat ?? null,
      input.lng ?? null,
      input.is_main ? 1 : 0
    )
    .run()

  return (await getBranchById(db, input.id))!
}

export async function updateBranch(
  db: D1Database,
  id: string,
  data: Partial<Pick<Branch, 'name' | 'address' | 'phone' | 'lat' | 'lng' | 'is_main'>>
): Promise<Branch | null> {
  if (data.is_main) {
    const branch = await getBranchById(db, id)
    if (branch) {
      await db
        .prepare('UPDATE branches SET is_main = 0 WHERE business_id = ?')
        .bind(branch.business_id)
        .run()
    }
  }

  const sets: string[] = []
  const values: unknown[] = []

  if (data.name !== undefined) { sets.push('name = ?'); values.push(data.name) }
  if (data.address !== undefined) { sets.push('address = ?'); values.push(data.address) }
  if (data.phone !== undefined) { sets.push('phone = ?'); values.push(data.phone) }
  if (data.lat !== undefined) { sets.push('lat = ?'); values.push(data.lat) }
  if (data.lng !== undefined) { sets.push('lng = ?'); values.push(data.lng) }
  if (data.is_main !== undefined) { sets.push('is_main = ?'); values.push(data.is_main ? 1 : 0) }

  if (sets.length === 0) return getBranchById(db, id)

  sets.push("updated_at = datetime('now')")
  values.push(id)

  await db.prepare(`UPDATE branches SET ${sets.join(', ')} WHERE id = ?`).bind(...values).run()

  return getBranchById(db, id)
}

export async function softDeleteBranch(db: D1Database, id: string): Promise<void> {
  await db
    .prepare("UPDATE branches SET deleted_at = datetime('now'), updated_at = datetime('now') WHERE id = ?")
    .bind(id)
    .run()
}
