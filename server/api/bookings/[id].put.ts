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
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'BOOKING_ID_REQUIRED' })

  const body = schema.parse(await readBody(event))
  if (user.role !== 'admin' && !isWithinCustomerBookingWindow(body.date)) {
    throw createError({ statusCode: 400, statusMessage: 'BOOKING_DATE_OUT_OF_RANGE' })
  }
  if (!generateSlots(body.date).includes(body.time)) {
    throw createError({ statusCode: 400, statusMessage: 'INVALID_SLOT' })
  }

  const carResult = await dbQuery<{ id: string; category: 'passenger'|'crossover'|'minivan'|'commercial'; make: string; model: string }>(
    'SELECT id,category,make,model FROM cars WHERE id = $1 AND user_id = $2',
    [body.carId, user.id]
  )
  const car = carResult.rows[0]
  if (!car) throw createError({ statusCode: 404, statusMessage: 'CAR_NOT_FOUND' })

  const priceCents = priceCentsForCategory(car.category)

  try {
    const result = await dbQuery(
      `WITH user_lock AS (
         SELECT pg_advisory_xact_lock(hashtextextended($6, 0))
       )
       UPDATE bookings b
       SET car_id = $2,
           booking_date = $3,
           booking_time = $4,
           price_cents = $5,
           updated_at = now()
       FROM user_lock
       WHERE b.id = $1
         AND b.user_id = $6
         AND b.status IN ('pending','confirmed')
         AND (b.booking_date > CURRENT_DATE OR (b.booking_date = CURRENT_DATE AND b.booking_time > CURRENT_TIME))
         AND NOT EXISTS (
           SELECT 1 FROM blocked_slots
           WHERE booking_date = $3 AND (booking_time = $4 OR booking_time IS NULL)
         )
         AND NOT EXISTS (
           SELECT 1 FROM bookings other
           WHERE other.booking_date = $3
             AND other.booking_time = $4
             AND other.status NOT IN ('cancelled_customer','cancelled_admin','no_show')
             AND other.id <> b.id
         )
         AND (
           $7 = true OR (
             (SELECT COUNT(*) FROM bookings x
              WHERE x.user_id = $6
                AND x.id <> b.id
                AND x.booking_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
                AND x.status NOT IN ('cancelled_customer','cancelled_admin','no_show')) < $8
             AND
             (SELECT COUNT(*) FROM bookings x
              WHERE x.user_id = $6
                AND x.car_id = $2
                AND x.id <> b.id
                AND x.booking_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
                AND x.status NOT IN ('cancelled_customer','cancelled_admin','no_show')) < $9
           )
         )
       RETURNING b.id,b.booking_date,b.booking_time,b.price_cents,b.status,b.car_id`,
      [
        id,
        car.id,
        body.date,
        body.time,
        priceCents,
        user.id,
        user.role === 'admin',
        MAX_CUSTOMER_BOOKINGS_IN_WINDOW,
        MAX_CUSTOMER_BOOKINGS_PER_CAR_IN_WINDOW
      ]
    )

    if (!result.rows[0]) {
      const existing = await dbQuery(
        `SELECT id FROM bookings
         WHERE id = $1 AND user_id = $2
           AND status IN ('pending','confirmed')
           AND (booking_date > CURRENT_DATE OR (booking_date = CURRENT_DATE AND booking_time > CURRENT_TIME))`,
        [id, user.id]
      )
      if (!existing.rows[0]) throw createError({ statusCode: 409, statusMessage: 'BOOKING_CANNOT_BE_EDITED' })

      const counts = await dbQuery<{ total: number; car_total: number }>(
        `SELECT
           COUNT(*) FILTER (WHERE id <> $2 AND status NOT IN ('cancelled_customer','cancelled_admin','no_show'))::int AS total,
           COUNT(*) FILTER (WHERE id <> $2 AND car_id = $3 AND status NOT IN ('cancelled_customer','cancelled_admin','no_show'))::int AS car_total
         FROM bookings
         WHERE user_id = $1
           AND booking_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'`,
        [user.id, id, car.id]
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
