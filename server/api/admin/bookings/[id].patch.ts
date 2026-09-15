import { z } from 'zod'
import { requireAdmin } from '../../../auth'
import { dbQuery } from '../../../db'

const schema = z.object({ status: z.enum(['pending','confirmed','completed','cancelled_customer','cancelled_admin','no_show']) })

export default defineEventHandler(async event => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = schema.parse(await readBody(event))
  const result = await dbQuery('UPDATE bookings SET status=$1,updated_at=now() WHERE id=$2 RETURNING id,status', [body.status,id])
  if (!result.rows[0]) throw createError({ statusCode: 404, statusMessage: 'BOOKING_NOT_FOUND' })
  return { booking: result.rows[0] }
})
