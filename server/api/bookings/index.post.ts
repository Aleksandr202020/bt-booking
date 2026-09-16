import { z } from 'zod'
import { requireUser } from '../../auth'
import { dbQuery, DatabaseQueryError } from '../../db'
import { generateSlots, isWithinCustomerBookingWindow } from '../../../shared/slots'
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
  if (!generateSlots(body.date).includes(body.time)) throw createError({ statusCode: 400, statusMessage: 'INVALID_SLOT' })

  const carResult = await dbQuery<{ id: string; category: 'passenger'|'crossover'|'minivan'|'commercial'; make: string; model: string }>(
    'SELECT id,category,make,model FROM cars WHERE id = $1 AND user_id = $2', [body.carId, user.id]
  )
  const car = carResult.rows[0]
  if (!car) throw createError({ statusCode: 404, statusMessage: 'CAR_NOT_FOUND' })

  const priceCents = priceCentsForCategory(car.category)
  try {
    const result = await dbQuery(
      `INSERT INTO bookings (user_id,car_id,booking_date,booking_time,price_cents,status)
       SELECT $1,$2,$3,$4,$5,'pending'
       WHERE NOT EXISTS (
         SELECT 1 FROM blocked_slots
         WHERE booking_date = $3 AND (booking_time = $4 OR booking_time IS NULL)
       )
       RETURNING id,booking_date,booking_time,price_cents,status`,
      [user.id, car.id, body.date, body.time, priceCents]
    )
    if (!result.rows[0]) throw createError({ statusCode: 409, statusMessage: 'SLOT_UNAVAILABLE' })
    return { booking: result.rows[0] }
  } catch (error) {
    if (error instanceof DatabaseQueryError && error.code === '23505') throw createError({ statusCode: 409, statusMessage: 'SLOT_UNAVAILABLE' })
    throw error
  }
})
