import { createError, defineEventHandler, readBody } from 'h3'
import { getServerSession } from '~/server/utils/auth'
import { sql } from '~/server/utils/db'

export default defineEventHandler(async event => {
  const session = await getServerSession(event)
  if (!session?.user?.id) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readBody(event)
  const carId = Number(body?.carId)
  const date = String(body?.date || '')
  const time = String(body?.time || '')

  if (!Number.isInteger(carId) || !date || !time) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid booking data' })
  }

  try {
    const result = await sql`
      WITH user_lock AS (
        SELECT pg_advisory_xact_lock(hashtextextended(${session.user.id}::text, 0))
      )
      INSERT INTO bookings (user_id,car_id,booking_date,booking_time,price_cents,status)
      SELECT ${session.user.id},${carId},${date}::date,${time}::time,0,'pending'
      FROM user_lock
      WHERE NOT EXISTS (
        SELECT 1 FROM blocked_slots
        WHERE booking_date = ${date}::date AND (booking_time = ${time}::time OR booking_time IS NULL)
      )
      AND NOT EXISTS (
        SELECT 1 FROM bookings other
        WHERE other.booking_date = ${date}::date
          AND other.booking_time = ${time}::time
          AND other.status NOT IN ('cancelled_customer','cancelled_admin','no_show')
      )
      RETURNING id, booking_date, booking_time, status
    `

    if (!result.length) {
      throw createError({ statusCode: 409, statusMessage: 'SLOT_UNAVAILABLE' })
    }

    return { ok: true, booking: result[0] }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Booking creation failed:', error)
    throw createError({ statusCode: 500, statusMessage: 'BOOKING_CREATE_FAILED' })
  }
})
