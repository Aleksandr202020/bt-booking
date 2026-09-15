import { requireAdmin } from '../../auth'
import { dbQuery } from '../../db'

export default defineEventHandler(async event => {
  await requireAdmin(event)
  const q = getQuery(event)
  const from = typeof q.from === 'string' ? q.from : new Date().toISOString().slice(0, 10)
  const to = typeof q.to === 'string' ? q.to : from

  const result = await dbQuery(`
    SELECT
      b.id,
      b.user_id,
      b.car_id,
      b.booking_date,
      b.booking_time,
      b.price_cents,
      b.status,
      b.created_at,
      u.name,
      u.email,
      u.phone,
      c.make,
      c.model,
      c.category
    FROM bookings b
    JOIN users u ON u.id = b.user_id
    JOIN cars c ON c.id = b.car_id
    WHERE b.booking_date BETWEEN $1 AND $2
    ORDER BY b.booking_date, b.booking_time
  `, [from, to])

  return { bookings: result.rows }
})
