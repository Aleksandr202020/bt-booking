import { requireUser } from '../../auth'
import { dbQuery } from '../../db'

const ACTIVE_STATUSES = ['pending', 'confirmed']
const BOOKING_SELECT = `
  SELECT b.id,b.car_id,b.booking_date,b.booking_time,b.price_cents,b.status,b.created_at,
         c.make,c.model,c.category
  FROM bookings b
  JOIN cars c ON c.id = b.car_id
  WHERE b.user_id = $1`

export default defineEventHandler(async event => {
  const user = await requireUser(event)

  const upcomingResult = await dbQuery(
    `${BOOKING_SELECT}
     AND b.booking_date >= CURRENT_DATE
     AND b.status = ANY($2::text[])
     ORDER BY b.booking_date ASC, b.booking_time ASC`,
    [user.id, ACTIVE_STATUSES]
  )

  const historyResult = await dbQuery(
    `${BOOKING_SELECT}
     AND NOT (b.booking_date >= CURRENT_DATE AND b.status = ANY($2::text[]))
     ORDER BY b.booking_date DESC, b.booking_time DESC`,
    [user.id, ACTIVE_STATUSES]
  )

  return {
    upcoming: upcomingResult.rows,
    history: historyResult.rows
  }
})
