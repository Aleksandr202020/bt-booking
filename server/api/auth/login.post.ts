import { z } from 'zod'
import { dbQuery } from '../../db'
import { setSession, verifyPassword } from '../../auth'

const schema = z.object({ email: z.string().email().transform(v => v.toLowerCase()), password: z.string().min(1) })

export default defineEventHandler(async event => {
  const body = schema.parse(await readBody(event))
  const result = await dbQuery<{ id: string; name: string; email: string; phone: string; role: string; password_hash: string }>(
    'SELECT id,name,email,phone,role,password_hash FROM users WHERE email = $1', [body.email]
  )
  const user = result.rows[0]
  if (!user || !(await verifyPassword(body.password, user.password_hash))) {
    throw createError({ statusCode: 401, statusMessage: 'INVALID_CREDENTIALS' })
  }
  await setSession(event, user.id, user.role)
  return { ok: true }
})
