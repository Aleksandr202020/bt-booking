const SLOT_RE = /^\d{2}:00$/
const SLOTS = Array.from({ length: 12 }, (_, i) => `${String(i + 9).padStart(2, '0')}:00`)

let timer: ReturnType<typeof setTimeout> | undefined
let lastKey = ''

function findDateForSelect(select: HTMLSelectElement) {
  let el: HTMLElement | null = select.parentElement
  for (let depth = 0; el && depth < 6; depth++, el = el.parentElement) {
    const input = el.querySelector<HTMLInputElement>('input[type="date"]')
    if (input?.value) return input.value
  }
  return ''
}

function isSlotSelect(select: HTMLSelectElement) {
  const values = Array.from(select.options).map(o => o.value || o.textContent?.trim() || '')
  return SLOTS.every(slot => values.includes(slot))
}

async function updateSlotSelect(select: HTMLSelectElement) {
  if (!isSlotSelect(select)) return
  const date = findDateForSelect(select)
  if (!date) return

  const key = `${date}:${select.dataset.slotStatusKey || ''}`
  try {
    const data = await $fetch<any>('/api/admin/bookings', { query: { from: date, to: date } })
    const blocks = await $fetch<any>('/api/admin/blocks', { query: { from: date, to: date } })
    const booked = new Set((data.bookings || []).map((b: any) => String(b.booking_time).slice(0, 5)))
    const blocked = new Set((blocks.blocks || []).filter((b: any) => b.booking_time).map((b: any) => String(b.booking_time).slice(0, 5)))
    const wholeDay = (blocks.blocks || []).some((b: any) => !b.booking_time)
    const holiday = date.endsWith('-06-23') || date.endsWith('-06-24')

    for (const option of Array.from(select.options)) {
      const slot = option.value || option.textContent?.trim() || ''
      if (!SLOT_RE.test(slot)) continue
      const unavailable = holiday || wholeDay || booked.has(slot) || blocked.has(slot)
      option.disabled = unavailable && option.selected === false
      option.textContent = unavailable
        ? `${slot} — ${holiday ? 'HOLIDAY' : blocked.has(slot) || wholeDay ? 'BLOCKED' : 'BOOKED'}`
        : `${slot} — FREE`
    }

    select.title = holiday ? 'Holiday — no bookings' : 'Green = free, grey = unavailable'
    select.dataset.slotStatusKey = key
  } catch {
    // The server remains the source of truth; do not invent availability on API failure.
  }
}

function refresh() {
  if (location.pathname !== '/admin') return
  document.querySelectorAll<HTMLSelectElement>('select').forEach(select => {
    if (isSlotSelect(select)) void updateSlotSelect(select)
  })
}

function scheduleRefresh() {
  if (timer) clearTimeout(timer)
  timer = setTimeout(refresh, 100)
}

const observer = new MutationObserver(scheduleRefresh)
observer.observe(document.documentElement, { childList: true, subtree: true })

window.addEventListener('change', event => {
  const target = event.target as HTMLElement | null
  if (target?.matches('input[type="date"], select')) scheduleRefresh()
})

scheduleRefresh()
