import { requireUser } from '../../auth'
import { dbQuery } from '../../db'

const ACTIVE_STATUSES = ['pending', 'confirmed']

export default defineEventHandler(async event => {
  const user = await requireUser(event)

  const result = await dbQuery(`
    SELECT b.id,b.booking_date,b.booking_time,b.price_cents,b.status,b.created_at,
           c.make,c.model,c.category
    FROM bookings b
    JOIN cars c ON c.id = b.car_id
    WHERE b.user_id = $1
    ORDER BY b.booking_date DESC, b.booking_time DESC`,
    [user.id]
  )

  // Keep the split in PostgreSQL rather than comparing a PostgreSQL DATE
  // with a JavaScript/UTC date string. This avoids timezone-related mistakes
  // around midnight and guarantees that every user's own booking is shown.
  const upcomingResult = await dbQuery(`
    SELECT b.id,b.booking_date,b.booking_time,b.price_cents,b.status,b.created_at,
           c.make,c.model,c.category
    FROM bookings b
    JOIN cars c ON c.id = b.car_id
    WHERE b.user_id = $1
      AND b.booking_date >= CURRENT_DATE
      AND b.status = ANY($2::text[])
    ORDER BY b.booking_date ASC, b.booking_time ASC`,
    [user.id, ACTIVE_STATUSES]
  )

  const historyResult = await dbQuery(`
    SELECT b.id,b.booking_date,b.booking_time,b.price_cents,b.status,b.created_at,
           c.make,c.model,c.category
    FROM bookings b
    JOIN cars c ON c.id = b.car_id
    WHERE b.user_id = $1
      AND NOT (b.booking_date >= CURRENT_DATE AND b.status = ANY($2::text[]))
    ORDER BY b.booking_date DESC, b.booking_time DESC`,
    [user.id, ACTIVE_STATUSES]
  )

  // Keep the first query as a harmless consistency check while the two
  // explicit result sets above are the source returned to the UI.
  void result

  return {
    upcoming: upcomingResult.rows,
    history: historyResult.rows
  }
})
