import { requireUser } from '../../auth'
import { dbQuery } from '../../db'

export default defineEventHandler(async event => {
  const user = await requireUser(event)
  const result = await dbQuery(`
    SELECT b.id,b.booking_date,b.booking_time,b.price_cents,b.status,b.created_at,
           c.make,c.model,c.category
    FROM bookings b
    JOIN cars c ON c.id = b.car_id
    WHERE b.user_id = $1
    ORDER BY b.booking_date DESC, b.booking_time DESC`, [user.id])
  const now = new Date().toISOString().slice(0, 10)
  return {
    upcoming: result.rows.filter((b: any) => b.booking_date >= now && !['completed','cancelled_customer','cancelled_admin','no_show'].includes(b.status)),
    history: result.rows.filter((b: any) => b.booking_date < now || ['completed','cancelled_customer','cancelled_admin','no_show'].includes(b.status))
  }
})
