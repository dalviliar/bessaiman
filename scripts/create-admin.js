// Seeds the first super_admin user.
// Usage: node scripts/create-admin.js <email> <password> [full_name]
require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

async function main() {
  const [email, password, fullName] = process.argv.slice(2)
  if (!email || !password) {
    console.error('Usage: node scripts/create-admin.js <email> <password> [full_name]')
    process.exit(1)
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const role = await pool.query(`SELECT id FROM admin_roles WHERE name = 'super_admin'`)
  if (!role.rows[0]) {
    console.error('super_admin role not found — run db/schema.sql first')
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const result = await pool.query(
    `INSERT INTO admin_users (email, password_hash, full_name, role_id, is_active)
     VALUES ($1, $2, $3, $4, true)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
     RETURNING id, email`,
    [email, passwordHash, fullName ?? null, role.rows[0].id],
  )

  console.log('Admin user ready:', result.rows[0])
  await pool.end()
}

main().catch(err => { console.error(err); process.exit(1) })
