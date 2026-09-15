import { z } from 'zod'
import { dbQuery, DatabaseQueryError } from '../../db'
import { hashPassword, setSession } from '../../auth'

const bodySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200).transform(v => v.toLowerCase()),
  phone: z.string().trim().min(6).max(30),
  password: z.string().min(8).max(100)
})

export default defineEventHandler(async event => {
  const body = bodySchema.parse(await readBody(event))
  const passwordHash = await hashPassword(body.password)
  try {
    const result = await dbQuery<{ id: string; role: string }>(
      'INSERT INTO users (name,email,phone,password_hash) VALUES ($1,$2,$3,$4) RETURNING id,role',
      [body.name, body.email, body.phone, passwordHash]
    )
    const user = result.rows[0]
    await setSession(event, user.id, user.role)
    return { ok: true }
  } catch (error) {
    if (error instanceof DatabaseQueryError && error.code === '23505') throw createError({ statusCode: 409, statusMessage: 'EMAIL_ALREADY_REGISTERED' })
    throw error
  }
})
