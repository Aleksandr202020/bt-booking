import { z } from 'zod'
import { dbQuery } from '../../db'
import { setSession, effectiveRole, ensureUserModerationSchema } from '../../auth'
import { verifyPassword } from '../../auth'

const schema = z.object({ email: z.string().trim().email().transform(v => v.toLowerCase()), password: z.string().min(1) })

export default defineEventHandler(async event => {
  await ensureUserModerationSchema()
  const body = schema.parse(await readBody(event))
  const result = await dbQuery<{ id: string; name: string; email: string; phone: string; role: string; password_hash: string; banned_at: string | null }>(
    'SELECT id,name,email,phone,role,password_hash,banned_at FROM users WHERE LOWER(TRIM(email)) = $1', [body.email]
  )
  const user = result.rows[0]
  if (!user || !(await verifyPassword(body.password, user.password_hash))) {
    throw createError({ statusCode: 401, statusMessage: 'INVALID_CREDENTIALS' })
  }

  const role = effectiveRole(user.email, user.role)

  if (user.banned_at && role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'USER_BANNED' })
  }

  if (role === 'admin' && user.role !== 'admin') {
    await dbQuery("UPDATE users SET role = 'admin' WHERE id = $1", [user.id])
  }

  await setSession(event, user.id, role)
  return { ok: true, role }
})
