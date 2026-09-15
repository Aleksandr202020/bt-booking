import { requireUser } from '../../auth'
import { dbQuery } from '../../db'

export default defineEventHandler(async event => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'BOOKING_ID_REQUIRED' })
  const result = await dbQuery(
    `UPDATE bookings
     SET status = 'cancelled_customer', updated_at = now()
     WHERE id = $1 AND user_id = $2
       AND status IN ('pending','confirmed')
       AND (booking_date > CURRENT_DATE OR (booking_date = CURRENT_DATE AND booking_time > CURRENT_TIME))
     RETURNING id,status`, [id, user.id]
  )
  if (!result.rows[0]) throw createError({ statusCode: 409, statusMessage: 'BOOKING_CANNOT_BE_CANCELLED' })
  return { booking: result.rows[0] }
})
