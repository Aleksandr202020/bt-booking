import { z } from 'zod'
import { dbQuery } from '../db'
import { generateSlots, isHoliday } from '../../shared/slots'

const schema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })

export default defineEventHandler(async event => {
  const { date } = schema.parse(getQuery(event))
  if (isHoliday(date)) return { date, slots: [], holiday: true }

  const allSlots = generateSlots(date)
  const result = await dbQuery<{ booking_time: string | null }>(
    `SELECT to_char(booking_time, 'HH24:MI') AS booking_time
     FROM bookings
     WHERE booking_date = $1
       AND status NOT IN ('cancelled_customer','cancelled_admin','no_show')
     UNION
     SELECT to_char(booking_time, 'HH24:MI') AS booking_time
     FROM blocked_slots
     WHERE booking_date = $1`,
    [date]
  )

  const wholeDayBlocked = result.rows.some(row => row.booking_time === null)
  if (wholeDayBlocked) return { date, slots: [], holiday: false, blocked: true }

  const blocked = new Set(result.rows.map(row => row.booking_time).filter(Boolean))
  return { date, slots: allSlots.filter(slot => !blocked.has(slot)), holiday: false, blocked: false }
})
