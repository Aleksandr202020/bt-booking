export const SLOT_MINUTES = 60
export const OPEN_HOUR = 9
export const CLOSE_HOUR = 21
export const HOLIDAYS = ['06-23', '06-24']

export function isHoliday(date: string) {
  const [, month, day] = date.split('-')
  return HOLIDAYS.includes(`${month}-${day}`)
}

export function generateSlots(date: string) {
  if (isHoliday(date)) return []
  const slots: string[] = []
  for (let hour = OPEN_HOUR; hour < CLOSE_HOUR; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`)
  }
  return slots
}
