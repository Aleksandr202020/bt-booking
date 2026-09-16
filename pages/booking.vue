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
const success = ref(false)
const brands = Object.keys((await import('#shared/catalog')).vehicleCatalog)
const models = ref<string[]>([])
const newMake = ref('BMW')
const newModel = ref('')
const confirmedBooking = ref<{date:string,time:string,car:string,price:string}|null>(null)
const canBook = computed(() => Boolean(selectedCar.value && date.value && selectedTime.value && !bookingInProgress.value))
const minBookingDate = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
})
const maxBookingDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
})
function isSlotPast(slot: string) {
  if (date.value !== minBookingDate.value) return false
  const [hour, minute] = slot.split(':').map(Number)
  const now = new Date()
  return hour < now.getHours() || (hour === now.getHours() && minute <= now.getMinutes())
}
watch(cars, value => { const list = value?.cars ?? []; if (!selectedCar.value && list.length === 1) selectedCar.value = list[0].id }, { immediate: true })
async function loadSlots(){ if(!date.value)return; error.value='';loadingSlots.value=true;selectedTime.value='';try{const r:any=await $fetch('/api/slots',{query:{date:date.value}});slots.value=r.slots}catch(e:any){slots.value=[];error.value=e?.statusCode===503||e?.data?.statusMessage==='DATABASE_UNAVAILABLE'?t('dbUnavailable'):t('bookingFailed')}finally{loadingSlots.value=false} }
async function addCar(){if(!newModel.value)return;error.value='';try{const result:any=await $fetch('/api/cars',{method:'POST',body:{make:newMake.value,model:newModel.value}});newModel.value='';await refreshCars();if(result?.car?.id)selectedCar.value=result.car.id}catch(e:any){error.value=e?.data?.statusMessage==='CAR_LIMIT_REACHED'?t('carLimit'):e?.statusCode===503?t('dbUnavailable'):t('bookingFailed')}}
async function book(){
  if(!canBook.value||isSlotPast(selectedTime.value))return
  error.value=''
  bookingInProgress.value=true
  const car=(cars.value?.cars??[]).find((c:any)=>c.id===selectedCar.value)
  const price=car?.category==='passenger'?'25':car?.category==='commercial'?'35':'30'
  try{
    await $fetch('/api/bookings',{method:'POST',body:{carId:selectedCar.value,date:date.value,time:selectedTime.value}})
    confirmedBooking.value={date:date.value,time:selectedTime.value,car:car?`${car.make} ${car.model}`:'',price}
    success.value=true
    selectedTime.value=''
    await loadSlots()
  }catch(e:any){
    const status=e?.data?.statusMessage
    const message=status==='BOOKING_DATE_OUT_OF_RANGE'
      ?t('bookingDateRange')
      :status==='BOOKING_LIMIT_REACHED'
        ?t('bookingLimit')
        :status==='CAR_BOOKING_LIMIT_REACHED'
          ?t('carBookingLimit')
          :status==='SLOT_UNAVAILABLE'
            ?t('slotUnavailable')
            :status==='INVALID_SLOT'
              ?t('slotUnavailable')
              :status==='CAR_NOT_FOUND'
                ?t('bookingFailed')
                :e?.statusCode===503
                  ?t('dbUnavailable')
                  :t('bookingFailed')
    // loadSlots() clears error.value, so refresh the slots first and only
    // then show the POST error. Otherwise failed bookings look like nothing happened.
    const failedDate=date.value
    try {
      const r:any=await $fetch('/api/slots',{query:{date:failedDate}})
      slots.value=r.slots
    }catch{
      // Keep the original booking error visible even if slot refresh fails.
    }
    error.value=message
  }finally{bookingInProgress.value=false}
}
watch(newMake,async m=>{const {vehicleCatalog}=await import('#shared/catalog');models.value=[...(vehicleCatalog as any)[m]||[]]},{immediate:true})
</script>
<template>
<div class="mx-auto max-w-2xl">
  <div v-if="success" class="rounded-2xl border bg-white p-6 text-center">
    <div class="text-5xl">✓</div><h1 class="mt-4 text-2xl font-bold">{{t('bookingSuccessTitle')}}</h1><p class="mt-3 text-slate-600">{{t('bookingSuccessText')}}</p>
    <div v-if="confirmedBooking" class="mt-5 rounded-xl bg-slate-50 p-4 text-left space-y-1"><p><strong>{{t('date')}}:</strong> {{confirmedBooking.date}}</p><p><strong>{{t('freeTime')}}:</strong> {{confirmedBooking.time}}</p><p><strong>{{t('carLabel')}}:</strong> {{confirmedBooking.car}}</p><p><strong>{{t('price')}}:</strong> {{confirmedBooking.price}} €</p></div>
    <div class="mt-6 grid gap-3 sm:grid-cols-2"><button type="button" class="rounded-xl bg-slate-900 p-3 font-semibold text-white" @click="navigateTo('/account')">{{t('goToAccount')}}</button><button type="button" class="rounded-xl border p-3 font-semibold" @click="success=false">{{t('bookAnother')}}</button></div>
  </div>
  <template v-else>
    <h1 class="text-3xl font-bold">{{t('booking')}}</h1><p class="mt-2 text-slate-600">{{me?.user?.name}}</p>
    <div class="mt-6 rounded-2xl border bg-white p-5 space-y-5">
      <div><label class="font-semibold">{{t('car')}}</label><select v-model="selectedCar" class="mt-2 w-full rounded-xl border p-3"><option value="">{{t('selectCar')}}</option><option v-for="car in cars?.cars" :key="car.id" :value="car.id">{{car.make}} {{car.model}} — {{car.category==='passenger'?'25':car.category==='commercial'?'35':'30'}} €</option></select></div>
      <div class="rounded-xl bg-slate-50 p-4"><p class="font-semibold">{{t('addAnotherCar')}}</p><div class="mt-3 grid gap-3 sm:grid-cols-2"><select v-model="newMake" class="rounded-xl border p-3"><option v-for="b in brands" :key="b">{{b}}</option></select><select v-model="newModel" class="rounded-xl border p-3"><option value="">{{t('model')}}</option><option v-for="m in models" :key="m">{{m}}</option></select></div><button type="button" class="mt-3 rounded-xl border bg-white px-4 py-2" @click="addCar">{{t('addCar')}}</button></div>
      <div><label class="font-semibold">{{t('date')}}</label><input v-model="date" :min="minBookingDate" :max="maxBookingDate" type="date" class="mt-2 w-full rounded-xl border p-3" @change="loadSlots"><p class="mt-1 text-xs text-slate-500">{{t('bookingDateRange')}}</p></div>
      <div><div class="flex items-center justify-between"><label class="font-semibold">{{t('freeTime')}}</label><button v-if="date" type="button" class="text-sm underline" @click="loadSlots">{{t('retry')}}</button></div><div class="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4"><button v-for="slot in slots" :key="slot" type="button" class="rounded-xl border p-3 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-70" :disabled="isSlotPast(slot)" :class="selectedTime===slot&&!isSlotPast(slot)?'bg-slate-900 text-white':''" @click="selectedTime=slot">{{slot}}</button></div><p v-if="loadingSlots" class="mt-2 text-sm text-slate-500">{{t('checkDb')}}</p><p v-if="!loadingSlots&&date&&!slots.length&&!error" class="mt-2 text-sm text-slate-500">{{t('noSlots')}}</p></div>
      <p v-if="error" class="rounded-xl bg-red-50 p-3 text-red-700">{{error}}</p><button type="button" :disabled="!canBook||isSlotPast(selectedTime)" class="w-full rounded-xl bg-slate-900 p-3 font-semibold text-white disabled:opacity-40" @click="book">{{bookingInProgress ? '…' : t('book')}}</button>
    </div>
  </template>
</div>
</template>
