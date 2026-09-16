<script setup lang="ts">
const { t } = useLocale()
const today = new Date().toISOString().slice(0, 10)
type AdminTab = 'calendar' | 'bookings' | 'manual' | 'blocks' | 'banned'
const date = ref(today)
const to = ref(today)
const bookings = ref<any[]>([])
const blocks = ref<any[]>([])
const users = ref<any[]>([])
const error = ref('')
const loading = ref(false)
const activeTab = ref<AdminTab>('calendar')
const editing = ref<any | null>(null)
const editDate = ref('')
const editTime = ref('')
const editCarId = ref('')
const manualUserId = ref('')
const manualCarId = ref('')
const manualDate = ref(today)
const manualTime = ref('')
const blockDate = ref(today)
const blockTime = ref('')
const blockReason = ref('')
const slots = Array.from({ length: 12 }, (_, i) => `${String(i + 9).padStart(2, '0')}:00`)

const selectedUser = computed(() => users.value.find(u => u.id === manualUserId.value))
const selectedEditCars = computed(() => users.value.find(u => u.id === editing.value?.user_id)?.cars ?? [])
const bannedUsers = computed(() => users.value.filter(u => u.banned_at))
const editingBookingId = computed(() => editing.value?.id ?? '')

function normalizeTime(value: any) { return value == null ? '' : String(value).slice(0, 5) }
function isHoliday(value: string) { const m = value.slice(5); return m === '06-23' || m === '06-24' }
function userById(id: string) { return users.value.find(u => u.id === id) }
function isBanned(id: string) { return Boolean(userById(id)?.banned_at) }
function bookingsFor(dateValue: string) { return bookings.value.filter(b => String(b.booking_date).slice(0, 10) === dateValue) }
function blocksFor(dateValue: string) { return blocks.value.filter(b => String(b.booking_date).slice(0, 10) === dateValue) }
function slotTaken(dateValue: string, time: string, ignoreId = '') {
  return bookingsFor(dateValue).some(b => b.id !== ignoreId && !['cancelled_customer', 'cancelled_admin', 'no_show'].includes(b.status) && normalizeTime(b.booking_time) === time)
    || blocksFor(dateValue).some(b => !b.booking_time || normalizeTime(b.booking_time) === time)
}
function availableSlots(dateValue: string, ignoreId = '') {
  if (!dateValue || isHoliday(dateValue)) return []
  return slots.filter(s => !slotTaken(dateValue, s, ignoreId))
}
const manualAvailableSlots = computed(() => availableSlots(manualDate.value))
const editAvailableSlots = computed(() => editing.value ? availableSlots(editDate.value, editingBookingId.value) : [])

watch(manualDate, () => {
  if (!manualAvailableSlots.value.includes(manualTime.value)) manualTime.value = manualAvailableSlots.value[0] ?? ''
})
watch(editDate, () => {
  if (!editAvailableSlots.value.includes(editTime.value)) editTime.value = editAvailableSlots.value[0] ?? ''
})
watch(manualUserId, () => { manualCarId.value = selectedUser.value?.cars?.[0]?.id ?? '' })

async function loadUsers() {
  try {
    const r: any = await $fetch('/api/admin/users')
    users.value = r.users
  } catch (e: any) { error.value = e?.statusCode === 503 ? t('dbUnavailable') : t('loadFailed') }
}
async function load() {
  loading.value = true; error.value = ''
  try {
    const [b, bl, u] = await Promise.all([
      $fetch<any>('/api/admin/bookings', { query: { from: date.value, to: to.value } }),
      $fetch<any>('/api/admin/blocks', { query: { from: date.value, to: to.value } }),
      $fetch<any>('/api/admin/users')
    ])
    bookings.value = b.bookings; blocks.value = bl.blocks; users.value = u.users
  } catch (e: any) {
    error.value = e?.statusCode === 401 ? t('needLogin') : e?.statusCode === 403 ? t('noAdminAccess') : e?.statusCode === 503 ? t('dbUnavailable') : t('loadFailed')
  } finally { loading.value = false }
}
function setTab(tab: AdminTab) { activeTab.value = tab; if (tab === 'manual' || tab === 'banned') loadUsers() }

function startEdit(b: any) {
  editing.value = b
  editDate.value = String(b.booking_date).slice(0, 10)
  editTime.value = normalizeTime(b.booking_time)
  editCarId.value = b.car_id
}
function closeEdit() { editing.value = null }

async function saveEdit() {
  if (!editing.value || !editDate.value || !editTime.value || !editCarId.value) return
  const bookingId = editing.value.id
  const newDate = editDate.value
  const newTime = editTime.value
  const newCarId = editCarId.value
  error.value = ''
  try {
    const result: any = await $fetch(`/api/admin/bookings/${bookingId}`, {
      method: 'PATCH',
      body: { date: newDate, time: newTime, carId: newCarId }
    })
    const updated = result.booking
    const index = bookings.value.findIndex(b => b.id === bookingId)
    if (index >= 0 && updated) bookings.value[index] = { ...bookings.value[index], ...updated }
    editing.value = null
    await load()
  } catch (e: any) {
    const status = e?.data?.statusMessage
    error.value = status === 'SLOT_UNAVAILABLE' || e?.statusCode === 409 ? t('slotUnavailable') : status === 'HOLIDAY' ? 'Holiday — bookings are closed.' : t('bookingFailed')
  }
}

async function changeStatus(id: string, status: string) {
  error.value = ''
  try { await $fetch(`/api/admin/bookings/${id}`, { method: 'PATCH', body: { status } }); await load() }
  catch { error.value = t('bookingFailed') }
}
async function banClient(userId: string) {
  if (!confirm('Ban this customer from making online bookings?')) return
  try { await $fetch(`/api/admin/users/${userId}/ban`, { method: 'PATCH', body: { banned: true, reason: 'No-show' } }); await loadUsers() }
  catch (e: any) { error.value = e?.data?.statusMessage || t('bookingFailed') }
}
async function unbanClient(userId: string) {
  if (!confirm('Unban this customer?')) return
  try { await $fetch(`/api/admin/users/${userId}/ban`, { method: 'PATCH', body: { banned: false } }); await loadUsers() }
  catch (e: any) { error.value = e?.data?.statusMessage || t('bookingFailed') }
}
async function createManual() {
  if (!manualUserId.value || !manualCarId.value || !manualDate.value || !manualTime.value) return
  error.value = ''
  try {
    await $fetch('/api/admin/bookings', { method: 'POST', body: { userId: manualUserId.value, carId: manualCarId.value, date: manualDate.value, time: manualTime.value, status: 'confirmed' } })
    await load(); activeTab.value = 'calendar'; manualUserId.value = ''; manualCarId.value = ''; manualTime.value = ''
  } catch (e: any) {
    const status = e?.data?.statusMessage
    error.value = status === 'SLOT_UNAVAILABLE' || e?.statusCode === 409 ? t('slotUnavailable') : status === 'INVALID_SLOT' ? 'Invalid time slot.' : status === 'HOLIDAY' ? 'Holiday — bookings are closed.' : t('bookingFailed')
  }
}
async function addBlock() {
  if (!blockDate.value) return
  if (isHoliday(blockDate.value)) { error.value = 'Holiday — this date is already closed.'; return }
  error.value = ''
  try {
    await $fetch('/api/admin/blocks', { method: 'POST', body: { date: blockDate.value, time: blockTime.value || null, reason: blockReason.value } })
    blockReason.value = ''; blockTime.value = ''; await load()
  } catch (e: any) {
    const status = e?.data?.statusMessage
    error.value = status === 'BLOCK_ALREADY_EXISTS' ? 'This time is already blocked.' : status === 'SLOT_ALREADY_BOOKED' ? 'This time already has a booking and cannot be blocked.' : status === 'HOLIDAY' ? 'Holiday — this date is already closed.' : t('bookingFailed')
  }
}
async function removeBlock(id: string) { try { await $fetch(`/api/admin/blocks/${id}`, { method: 'DELETE' }); await load() } catch { error.value = t('bookingFailed') } }

await load()
</script>

<template>
<div class="mx-auto max-w-7xl space-y-6">
  <header class="rounded-2xl border bg-white p-5 shadow-sm"><div class="flex flex-wrap items-center justify-between gap-4"><div><h1 class="text-3xl font-bold">{{t('adminPanel')}}</h1><p class="text-slate-600">BT Automazgātava · {{t('manageBookings')}}</p></div><button class="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white" @click="load">{{t('refresh')}}</button></div><div class="mt-5 flex flex-wrap gap-2"><button v-for="tab in ['calendar','bookings','manual','blocks','banned']" :key="tab" type="button" class="rounded-xl px-4 py-2 font-semibold" :class="activeTab===tab?'bg-slate-900 text-white':'border bg-white'" @click="setTab(tab as AdminTab)">{{tab==='calendar'?'Calendar':tab==='bookings'?'All bookings':tab==='manual'?'Manual booking':tab==='blocks'?'Blocked time':'Banned clients'}}</button></div></header>
  <p v-if="error" class="rounded-xl bg-red-50 p-3 text-red-700">{{error}}</p>
  <section v-if="activeTab==='calendar'" class="space-y-4"><div class="flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-4"><div><label class="text-sm font-semibold">{{t('date')}}</label><input v-model="date" type="date" class="mt-1 rounded-xl border p-3" @change="to=date;load()"></div><p v-if="isHoliday(date)" class="rounded-xl bg-red-50 px-4 py-3 font-semibold text-red-700">Holiday — closed</p></div><div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"><div v-for="slot in slots" :key="slot" class="min-h-32 rounded-2xl border bg-white p-4"><div class="flex items-center justify-between"><b class="text-lg">{{slot}}</b><span v-if="slotTaken(date,slot)||isHoliday(date)" class="rounded-full bg-slate-200 px-2 py-1 text-xs">{{isHoliday(date)?'CLOSED':blocksFor(date).some(x=>!x.booking_time||normalizeTime(x.booking_time)===slot)?'BLOCKED':'BOOKED'}}</span></div><template v-for="b in bookingsFor(date).filter(x=>normalizeTime(x.booking_time)===slot && !['cancelled_customer','cancelled_admin','no_show'].includes(x.status))" :key="b.id"><div class="mt-3"><b>{{b.make}} {{b.model}}</b><p class="text-sm">{{b.name}}</p><p class="text-sm text-slate-500">{{(b.price_cents/100).toFixed(0)}} € · {{b.status}}</p><button class="mt-2 text-sm underline" @click="startEdit(b)">Edit</button></div></template><p v-if="!isHoliday(date) && !slotTaken(date,slot)" class="mt-6 text-sm text-emerald-700">FREE</p></div></div></section>
  <section v-if="activeTab==='bookings'" class="rounded-2xl border bg-white p-4"><div class="mb-4 flex flex-wrap gap-3"><input v-model="date" type="date" class="rounded-xl border p-3"><input v-model="to" type="date" class="rounded-xl border p-3"><button class="rounded-xl bg-slate-900 px-4 py-2 text-white" @click="load">{{t('refresh')}}</button></div><div class="space-y-3"><article v-for="b in bookings" :key="b.id" class="rounded-2xl border p-4"><div class="flex flex-wrap justify-between gap-2"><b>{{b.booking_date}} · {{normalizeTime(b.booking_time)}}</b><b>{{(b.price_cents/100).toFixed(0)}} €</b></div><p class="mt-1 font-semibold">{{b.name}} · {{b.phone}}</p><p>{{b.make}} {{b.model}}</p><div class="mt-3 flex flex-wrap items-center gap-2"><select class="rounded-xl border p-2" :value="b.status" @change="changeStatus(b.id,($event.target as HTMLSelectElement).value)"><option>pending</option><option>confirmed</option><option>completed</option><option>cancelled_admin</option><option>no_show</option></select><button class="rounded-xl border px-3 py-2" @click="startEdit(b)">Edit</button><button v-if="b.status==='no_show'&&!isBanned(b.user_id)" class="rounded-xl border border-red-300 bg-red-50 px-3 py-2 font-semibold text-red-700" @click="banClient(b.user_id)">Ban for no-show</button><button v-else-if="!isBanned(b.user_id)" class="rounded-xl border border-red-300 px-3 py-2 text-red-700" @click="banClient(b.user_id)">Ban client</button><button v-else class="rounded-xl border border-emerald-300 px-3 py-2 text-emerald-700" @click="unbanClient(b.user_id)">Unban</button></div></article><p v-if="!loading&&!bookings.length" class="py-6 text-center text-slate-500">{{t('noBookings')}}</p></div></section>
  <section v-if="activeTab==='manual'" class="max-w-xl rounded-2xl border bg-white p-5"><h2 class="text-xl font-bold">Manual booking</h2><div class="mt-5 space-y-3"><select v-model="manualUserId" class="w-full rounded-xl border p-3"><option value="">Select customer</option><option v-for="u in users" :key="u.id" :value="u.id">{{u.name}} · {{u.phone}}{{u.banned_at?' · BANNED':''}}</option></select><select v-model="manualCarId" class="w-full rounded-xl border p-3" :disabled="!selectedUser"><option value="">Select car</option><option v-for="c in selectedUser?.cars??[]" :key="c.id" :value="c.id">{{c.make}} {{c.model}}</option></select><input v-model="manualDate" type="date" class="w-full rounded-xl border p-3"><select v-model="manualTime" class="w-full rounded-xl border p-3"><option value="">{{isHoliday(manualDate)?'Holiday — no bookings':'Select available time'}}</option><option v-for="s in manualAvailableSlots" :key="s" :value="s">{{s}}</option></select><button class="w-full rounded-xl bg-slate-900 p-3 font-semibold text-white disabled:opacity-40" :disabled="!manualUserId||!manualCarId||!manualDate||!manualTime" @click="createManual">Create booking</button></div></section>
  <section v-if="activeTab==='blocks'" class="space-y-4"><div class="max-w-xl rounded-2xl border bg-white p-5"><h2 class="text-xl font-bold">Block time</h2><div class="mt-4 space-y-3"><input v-model="blockDate" type="date" class="w-full rounded-xl border p-3"><select v-model="blockTime" class="w-full rounded-xl border p-3"><option value="">Whole day</option><option v-for="s in slots" :key="s" :value="s" :disabled="slotTaken(blockDate,s)">{{s}}</option></select><input v-model="blockReason" class="w-full rounded-xl border p-3" placeholder="Reason"><p v-if="isHoliday(blockDate)" class="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">23.06 and 24.06 are already closed as holidays.</p><button class="w-full rounded-xl bg-slate-900 p-3 font-semibold text-white disabled:opacity-40" :disabled="isHoliday(blockDate)||Boolean(blockTime&&slotTaken(blockDate,blockTime))" @click="addBlock">Block</button></div></div><div class="space-y-2"><article v-for="b in blocks" :key="b.id" class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4"><div><b>{{b.booking_date}} · {{b.booking_time?normalizeTime(b.booking_time):'WHOLE DAY'}}</b><p class="text-sm text-slate-500">{{b.reason||'—'}}</p></div><button class="rounded-xl border px-3 py-2" @click="removeBlock(b.id)">Remove</button></article></div></section>
  <section v-if="activeTab==='banned'" class="rounded-2xl border bg-white p-4"><div class="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 class="text-xl font-bold">Banned clients</h2><p class="text-sm text-slate-500">Customers currently blocked from online bookings.</p></div><button class="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white" @click="loadUsers">Refresh</button></div><div v-if="!bannedUsers.length" class="rounded-xl bg-slate-50 p-6 text-center text-slate-500">No banned clients.</div><div v-else class="space-y-3"><article v-for="u in bannedUsers" :key="u.id" class="rounded-2xl border border-red-200 bg-red-50/40 p-4"><div class="flex flex-wrap items-start justify-between gap-3"><div><h3 class="font-bold">{{u.name}}</h3><p class="text-sm">{{u.phone}}</p><p class="text-sm text-slate-600">{{u.email}}</p><p class="mt-2 text-sm text-red-700"><b>Reason:</b> {{u.ban_reason||'No reason specified'}}</p></div><button class="rounded-xl border border-emerald-300 bg-white px-4 py-2 font-semibold text-emerald-700" @click="unbanClient(u.id)">Unban client</button></div></article></div></section>
  <div v-if="editing" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="closeEdit"><div class="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"><div class="flex items-center justify-between"><h2 class="text-xl font-bold">Edit booking</h2><button class="text-2xl" @click="closeEdit">×</button></div><div class="mt-5 space-y-3"><input v-model="editDate" type="date" class="w-full rounded-xl border p-3"><select v-model="editTime" class="w-full rounded-xl border p-3"><option value="">{{isHoliday(editDate)?'Holiday — no bookings':'Select available time'}}</option><option v-for="s in editAvailableSlots" :key="s" :value="s">{{s}}</option></select><select v-model="editCarId" class="w-full rounded-xl border p-3"><option value="">Select car</option><option v-for="c in selectedEditCars" :key="c.id" :value="c.id">{{c.make}} {{c.model}}</option></select><button class="w-full rounded-xl bg-slate-900 p-3 font-semibold text-white disabled:opacity-40" :disabled="!editDate||!editTime||!editCarId" @click="saveEdit">Save changes</button></div></div></div>
</div>
</template>
