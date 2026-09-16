import { z } from 'zod'
import { requireAdmin } from '../../auth'
import { dbQuery, DatabaseQueryError } from '../../db'
import { generateSlots, isHoliday } from '../../../shared/slots'

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:00$/).nullable().optional(),
  reason: z.string().trim().max(200).optional()
})

export default defineEventHandler(async event => {
  await requireAdmin(event)
  const body = schema.parse(await readBody(event))

  if (isHoliday(body.date) && body.time) {
    throw createError({ statusCode: 400, statusMessage: 'HOLIDAY' })
  }
  if (body.time && !generateSlots(body.date).includes(body.time)) {
    throw createError({ statusCode: 400, statusMessage: 'INVALID_SLOT' })
  }

  const bookingCheck = await dbQuery<{ id: string }>(
    `SELECT id FROM bookings
     WHERE booking_date = $1
       AND status NOT IN ('cancelled_customer','cancelled_admin','no_show')
       AND ($2::time IS NULL OR booking_time = $2::time)
     LIMIT 1`,
    [body.date, body.time ?? null]
  )

  if (bookingCheck.rows[0]) {
    throw createError({ statusCode: 409, statusMessage: 'SLOT_ALREADY_BOOKED' })
  }

  try {
    const result = await dbQuery(`
      INSERT INTO blocked_slots (booking_date,booking_time,reason)
      VALUES ($1,$2,$3)
      RETURNING id,booking_date,booking_time,reason`,
      [body.date, body.time ?? null, body.reason || null]
    )
    return { block: result.rows[0] }
  } catch (error) {
    if (error instanceof DatabaseQueryError && error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'BLOCK_ALREADY_EXISTS' })
    }
    throw error
  }
})
