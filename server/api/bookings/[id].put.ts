import { z } from 'zod'
import { requireUser } from '../../auth'
import { dbQuery, DatabaseQueryError } from '../../db'
import { generateSlots } from '../../../shared/slots'
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
      `UPDATE bookings b
       SET car_id = $2,
           booking_date = $3,
           booking_time = $4,
           price_cents = $5,
           updated_at = now()
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
       RETURNING id,booking_date,booking_time,price_cents,status,car_id`,
      [id, car.id, body.date, body.time, priceCents, user.id]
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
