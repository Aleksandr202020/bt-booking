import { z } from 'zod'
import { dbQuery } from '../../db'
import { setSession, effectiveRole } from '../../auth'
import { verifyPassword } from '../../auth'

const schema = z.object({ email: z.string().trim().email().transform(v => v.toLowerCase()), password: z.string().min(1) })

export default defineEventHandler(async event => {
  const body = schema.parse(await readBody(event))
  const result = await dbQuery<{ id: string; name: string; email: string; phone: string; role: string; password_hash: string }>(
    'SELECT id,name,email,phone,role,password_hash FROM users WHERE LOWER(TRIM(email)) = $1', [body.email]
  )
  const user = result.rows[0]
  if (!user || !(await verifyPassword(body.password, user.password_hash))) {
    throw createError({ statusCode: 401, statusMessage: 'INVALID_CREDENTIALS' })
  }

  // ADMIN_EMAIL is the single bootstrap identity for the administrator.
  // This works even when the account was originally registered as customer.
  const role = effectiveRole(user.email, user.role)

  if (role === 'admin' && user.role !== 'admin') {
    await dbQuery("UPDATE users SET role = 'admin' WHERE id = $1", [user.id])
  }

  await setSession(event, user.id, role)
  return { ok: true, role }
})
