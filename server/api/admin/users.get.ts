import { requireAdmin, ensureUserModerationSchema } from '../../auth'
import { dbQuery } from '../../db'

export default defineEventHandler(async event => {
  await requireAdmin(event)
  await ensureUserModerationSchema()
  const result = await dbQuery(`
    SELECT u.id,u.name,u.email,u.phone,u.role,u.banned_at,u.ban_reason,
           COALESCE(json_agg(json_build_object('id',c.id,'make',c.make,'model',c.model,'category',c.category) ORDER BY c.created_at DESC) FILTER (WHERE c.id IS NOT NULL), '[]') AS cars
    FROM users u
    LEFT JOIN cars c ON c.user_id = u.id
    GROUP BY u.id
    ORDER BY u.name,u.email`)
  return { users: result.rows }
})
