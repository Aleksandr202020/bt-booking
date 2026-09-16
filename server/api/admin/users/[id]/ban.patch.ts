import { z } from 'zod'
import { requireAdmin, ensureUserModerationSchema } from '../../../../auth'
import { dbQuery } from '../../../../db'

const schema = z.object({
  banned: z.boolean(),
  reason: z.string().trim().max(500).optional()
})

export default defineEventHandler(async event => {
  const admin = await requireAdmin(event)
  await ensureUserModerationSchema()
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'INVALID_USER_ID' })

  const body = schema.parse(await readBody(event))
  const result = await dbQuery<{ id: string; email: string; role: string }>(
    'SELECT id,email,role FROM users WHERE id = $1', [id]
  )
  const target = result.rows[0]
  if (!target) throw createError({ statusCode: 404, statusMessage: 'USER_NOT_FOUND' })
  if (target.id === admin.id || target.role === 'admin') {
    throw createError({ statusCode: 400, statusMessage: 'CANNOT_BAN_ADMIN' })
  }

  if (body.banned) {
    await dbQuery(
      'UPDATE users SET banned_at = COALESCE(banned_at, now()), ban_reason = $2 WHERE id = $1',
      [id, body.reason || 'No-show']
    )
  } else {
    await dbQuery(
      'UPDATE users SET banned_at = NULL, ban_reason = NULL WHERE id = $1',
      [id]
    )
  }

  return { ok: true, banned: body.banned }
})
