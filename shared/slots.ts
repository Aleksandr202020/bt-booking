export const SLOT_MINUTES = 60
export const OPEN_HOUR = 9
export const CLOSE_HOUR = 21
export const HOLIDAYS = ['06-23', '06-24']
export const MAX_CUSTOMER_BOOKING_DAYS = 30
export const MAX_CUSTOMER_BOOKINGS_IN_WINDOW = 10
export const MAX_CUSTOMER_BOOKINGS_PER_CAR_IN_WINDOW = 5

export function isHoliday(date: string) {
  const [, month, day] = date.split('-')
  return HOLIDAYS.includes(`${month}-${day}`)
}

export function isWithinCustomerBookingWindow(date: string) {
  const requested = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(requested.getTime())) return false
  const today = new Date()
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const max = new Date(start)
  max.setUTCDate(max.getUTCDate() + MAX_CUSTOMER_BOOKING_DAYS)
  return requested >= start && requested <= max
}

export function generateSlots(date: string) {
  if (isHoliday(date)) return []
  const slots: string[] = []
  for (let hour = OPEN_HOUR; hour < CLOSE_HOUR; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`)
  }
  return slots
}
