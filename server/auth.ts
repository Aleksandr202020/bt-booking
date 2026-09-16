import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { dbQuery } from './db'

const COOKIE = 'bt_booking_session'

function secret() {
  const value = useRuntimeConfig().sessionSecret
  if (!value || value.length < 32) throw new Error('SESSION_SECRET is not configured')
  return new TextEncoder().encode(value)
}

export function isAdminEmail(email: string) {
  const configured = useRuntimeConfig().adminEmail?.trim().toLowerCase()
  return Boolean(configured && email.trim().toLowerCase() === configured)
}

export function effectiveRole(email: string, role: string) {
  return isAdminEmail(email) ? 'admin' : role
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function setSession(event: any, userId: string, role: string) {
  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret())
  setCookie(event, COOKIE, token, { httpOnly: true, secure: !import.meta.dev, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
}

export async function clearSession(event: any) {
  deleteCookie(event, COOKIE, { path: '/' })
}

export async function getSession(event: any) {
  const token = getCookie(event, COOKIE)
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ['HS256'] })
    const userId = payload.sub
    if (!userId) return null

    const result = await dbQuery<{ id: string; name: string; email: string; phone: string; role: string }>(
      'SELECT id, name, email, phone, role FROM users WHERE id = $1', [userId]
    )
    const user = result.rows[0]
    if (!user) return null

    const role = effectiveRole(user.email, user.role)

    // Keep the database role synchronized with the configured admin identity.
    if (role === 'admin' && user.role !== 'admin') {
      await dbQuery("UPDATE users SET role = 'admin' WHERE id = $1", [user.id])
    }

    return { ...user, role }
  } catch (error) {
    if (error instanceof Error && error.message === 'DATABASE_UNAVAILABLE') throw error
    return null
  }
}

export async function requireUser(event: any) {
  const user = await getSession(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'AUTH_REQUIRED' })
  return user
}

export async function requireAdmin(event: any) {
  const user = await requireUser(event)
  if (effectiveRole(user.email, user.role) !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'ADMIN_REQUIRED' })
  }
  return user
}
