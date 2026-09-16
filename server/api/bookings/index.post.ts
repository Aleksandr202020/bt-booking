import { z } from 'zod'
import { requireUser } from '../../auth'
import { dbQuery, DatabaseQueryError } from '../../db'
import {
  generateSlots,
  isWithinCustomerBookingWindow,
  MAX_CUSTOMER_BOOKINGS_IN_WINDOW,
  MAX_CUSTOMER_BOOKINGS_PER_CAR_IN_WINDOW
} from '../../../shared/slots'
import { priceCentsForCategory } from '../../../shared/catalog'

const schema = z.object({
  carId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:00$/)
})

export default defineEventHandler(async event => {
  const user = await requireUser(event)
  const body = schema.parse(await readBody(event))

  if (user.role !== 'admin' && !isWithinCustomerBookingWindow(body.date)) {
    throw createError({ statusCode: 400, statusMessage: 'BOOKING_DATE_OUT_OF_RANGE' })
  }
  if (!generateSlots(body.date).includes(body.time)) {
    throw createError({ statusCode: 400, statusMessage: 'INVALID_SLOT' })
  }

  const carResult = await dbQuery<{ id: string; category: 'passenger'|'crossover'|'minivan'|'commercial'; make: string; model: string }>(
    'SELECT id,category,make,model FROM cars WHERE id = $1 AND user_id = $2', [body.carId, user.id]
  )
  const car = carResult.rows[0]
  if (!car) throw createError({ statusCode: 404, statusMessage: 'CAR_NOT_FOUND' })

  const priceCents = priceCentsForCategory(car.category)

  try {
    const result = await dbQuery(
      `WITH user_lock AS (
         SELECT pg_advisory_xact_lock(hashtextextended($1, 0))
       )
       INSERT INTO bookings (user_id,car_id,booking_date,booking_time,price_cents,status)
       SELECT $1,$2,$3::date,$4::time,$5,'pending'
       FROM user_lock
       WHERE NOT EXISTS (
         SELECT 1 FROM blocked_slots
         WHERE booking_date = $3::date AND (booking_time = $4::time OR booking_time IS NULL)
       )
       AND NOT EXISTS (
         SELECT 1 FROM bookings other
         WHERE other.booking_date = $3::date
           AND other.booking_time = $4::time
           AND other.status NOT IN ('cancelled_customer','cancelled_admin','no_show')
       )
       AND (
         $6 = true OR (
           (SELECT COUNT(*) FROM bookings b
            WHERE b.user_id = $1
              AND b.booking_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
              AND b.status NOT IN ('cancelled_customer','cancelled_admin','no_show')) < $7
           AND
           (SELECT COUNT(*) FROM bookings b
            WHERE b.user_id = $1
              AND b.car_id = $2
              AND b.booking_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
              AND b.status NOT IN ('cancelled_customer','cancelled_admin','no_show')) < $8
         )
       )
       RETURNING id,booking_date,booking_time,price_cents,status`,
      [
        user.id,
        car.id,
        body.date,
        body.time,
        priceCents,
        user.role === 'admin',
        MAX_CUSTOMER_BOOKINGS_IN_WINDOW,
        MAX_CUSTOMER_BOOKINGS_PER_CAR_IN_WINDOW
      ]
    )

    if (!result.rows[0]) {
      const counts = await dbQuery<{ total: number; car_total: number }>(
        `SELECT
           COUNT(*) FILTER (WHERE status NOT IN ('cancelled_customer','cancelled_admin','no_show'))::int AS total,
           COUNT(*) FILTER (WHERE car_id = $2 AND status NOT IN ('cancelled_customer','cancelled_admin','no_show'))::int AS car_total
         FROM bookings
         WHERE user_id = $1
           AND booking_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'`,
        [user.id, car.id]
      )
      const count = counts.rows[0]
      if (user.role !== 'admin' && count && count.total >= MAX_CUSTOMER_BOOKINGS_IN_WINDOW) {
        throw createError({ statusCode: 409, statusMessage: 'BOOKING_LIMIT_REACHED' })
      }
      if (user.role !== 'admin' && count && count.car_total >= MAX_CUSTOMER_BOOKINGS_PER_CAR_IN_WINDOW) {
        throw createError({ statusCode: 409, statusMessage: 'CAR_BOOKING_LIMIT_REACHED' })
      }
      throw createError({ statusCode: 409, statusMessage: 'SLOT_UNAVAILABLE' })
    }

    return { booking: result.rows[0] }
  } catch (error) {
    if (error instanceof DatabaseQueryError && error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'SLOT_UNAVAILABLE' })
    }
    throw error
  }
})
