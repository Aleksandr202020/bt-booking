import { requireUser } from '../../auth'
import { dbQuery } from '../../db'

export default defineEventHandler(async event => {
  const user = await requireUser(event)
  const result = await dbQuery('SELECT id,make,model,category,created_at FROM cars WHERE user_id = $1 ORDER BY created_at DESC', [user.id])
  return { cars: result.rows }
})
