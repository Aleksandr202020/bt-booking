<script setup lang="ts">
const { t } = useLocale()
const { data: me, error: meError } = await useFetch('/api/auth/me')
if (meError.value) await navigateTo('/login')
const { data: cars, refresh: refreshCars } = await useFetch('/api/cars')
const selectedCar = ref('')
const date = ref('')
const selectedTime = ref('')
const slots = ref<string[]>([])
const loadingSlots = ref(false)
const bookingInProgress = ref(false)
const error = ref('')
const success = ref('')
const brands = Object.keys((await import('#shared/catalog')).vehicleCatalog)
const models = ref<string[]>([])
const newMake = ref('BMW')
const newModel = ref('')

const canBook = computed(() => Boolean(selectedCar.value && date.value && selectedTime.value && !bookingInProgress.value))

watch(cars, value => {
  const list = value?.cars ?? []
  if (!selectedCar.value && list.length === 1) selectedCar.value = list[0].id
}, { immediate: true })

async function loadSlots(){
  if(!date.value) return
  error.value=''
  success.value=''
  loadingSlots.value=true
  selectedTime.value=''
  try {
    const r:any=await $fetch('/api/slots',{query:{date:date.value}})
    slots.value=r.slots
  } catch(e:any) {
    slots.value=[]
    error.value=e?.statusCode===503||e?.data?.statusMessage==='DATABASE_UNAVAILABLE'?t('dbUnavailable'):t('bookingFailed')
  } finally {
    loadingSlots.value=false
  }
}

async function addCar(){
  if(!newModel.value) return
  error.value=''
  try {
    const result:any=await $fetch('/api/cars',{method:'POST',body:{make:newMake.value,model:newModel.value}})
    newModel.value=''
    await refreshCars()
    if (result?.car?.id) selectedCar.value = result.car.id
  } catch(e:any) {
    error.value=e?.data?.statusMessage==='CAR_LIMIT_REACHED'?t('carLimit'):e?.statusCode===503?t('dbUnavailable'):t('bookingFailed')
  }
}

async function book(){
  if (!canBook.value) return
  error.value=''
  success.value=''
  bookingInProgress.value=true
  try {
    await $fetch('/api/bookings',{method:'POST',body:{carId:selectedCar.value,date:date.value,time:selectedTime.value}})
    success.value=t('booked')
    selectedTime.value=''
    await loadSlots()
  } catch(e:any) {
    error.value=e?.statusCode===503?t('dbUnavailable'):e?.data?.statusMessage==='SLOT_UNAVAILABLE'?t('slotUnavailable'):t('bookingFailed')
    await loadSlots()
  } finally {
    bookingInProgress.value=false
  }
}

watch(newMake,async m=>{
  const {vehicleCatalog}=await import('#shared/catalog')
  models.value=[...(vehicleCatalog as any)[m]||[]]
},{immediate:true})
</script>
<template>
  <div class="mx-auto max-w-2xl">
    <h1 class="text-3xl font-bold">{{ t('booking') }}</h1>
    <p class="mt-2 text-slate-600">{{me?.user?.name}}</p>
    <div class="mt-6 rounded-2xl border bg-white p-5 space-y-5">
      <div>
        <label class="font-semibold">{{ t('car') }}</label>
        <select v-model="selectedCar" class="mt-2 w-full rounded-xl border p-3">
          <option value="">{{ t('selectCar') }}</option>
          <option v-for="car in cars?.cars" :key="car.id" :value="car.id">{{car.make}} {{car.model}} — {{car.category==='passenger'?'25':car.category==='commercial'?'35':'30'}} €</option>
        </select>
      </div>
      <div class="rounded-xl bg-slate-50 p-4">
        <p class="font-semibold">{{ t('addAnotherCar') }}</p>
        <div class="mt-3 grid gap-3 sm:grid-cols-2">
          <select v-model="newMake" class="rounded-xl border p-3"><option v-for="b in brands" :key="b">{{b}}</option></select>
          <select v-model="newModel" class="rounded-xl border p-3"><option value="">{{ t('model') }}</option><option v-for="m in models" :key="m">{{m}}</option></select>
        </div>
        <button type="button" class="mt-3 rounded-xl border bg-white px-4 py-2" @click="addCar">{{ t('addCar') }}</button>
      </div>
      <div>
        <label class="font-semibold">{{ t('date') }}</label>
        <input v-model="date" type="date" class="mt-2 w-full rounded-xl border p-3" @change="loadSlots">
      </div>
      <div>
        <div class="flex items-center justify-between"><label class="font-semibold">{{ t('freeTime') }}</label><button v-if="date" type="button" class="text-sm underline" @click="loadSlots">{{ t('retry') }}</button></div>
        <div class="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
          <button v-for="slot in slots" :key="slot" type="button" class="rounded-xl border p-3" :class="selectedTime===slot?'bg-slate-900 text-white':''" @click="selectedTime=slot">{{slot}}</button>
        </div>
        <p v-if="loadingSlots" class="mt-2 text-sm text-slate-500">{{ t('checkDb') }}</p>
        <p v-if="!loadingSlots&&date&&!slots.length&&!error" class="mt-2 text-sm text-slate-500">{{ t('noSlots') }}</p>
      </div>
      <p v-if="error" class="rounded-xl bg-red-50 p-3 text-red-700">{{error}}</p>
      <p v-if="success" class="rounded-xl bg-green-50 p-3 text-green-700">{{success}}</p>
      <button type="button" :disabled="!canBook" class="w-full rounded-xl bg-slate-900 p-3 font-semibold text-white disabled:opacity-40" @click="book">{{ t('book') }}</button>
    </div>
  </div>
</template>
