import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { queryOne } from '@/lib/db'
import type { AdminUser } from '@/lib/admin'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret-change-me')
const COOKIE_NAME = 'admin_session'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

export interface SessionPayload {
  uid: string
  [key: string]: unknown
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(SECRET)
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    if (typeof payload.uid !== 'string') return null
    return { uid: payload.uid }
  } catch {
    return null
  }
}

export async function setSessionCookie(token: string) {
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySession(token)
}

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const session = await getSessionFromCookies()
  if (!session) return null
  return queryOne<AdminUser>(
    `SELECT u.id, u.email, u.full_name, u.role_id, u.is_active, u.created_by, u.last_seen, u.created_at,
       row_to_json(r) AS role
     FROM admin_users u
     LEFT JOIN admin_roles r ON r.id = u.role_id
     WHERE u.id = $1 AND u.is_active = true`,
    [session.uid],
  )
}

export { COOKIE_NAME }
