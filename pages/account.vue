<script setup lang="ts">
import { minBookingDate, maxBookingDate, isWithinBookingWindow } from '#shared/slots'

const { t } = useLocale()
const { data: me, error: meError } = await useFetch('/api/auth/me'); if(meError.value) await navigateTo('/login')
const { data: cars, refresh: refreshCars } = await useFetch('/api/cars')
const { data: bookings, refresh: refreshBookings } = await useFetch('/api/bookings')
const brands = Object.keys((await import('#shared/catalog')).vehicleCatalog)
const models=ref<string[]>([]); const make=ref('BMW'); const model=ref(''); const error=ref('')
const editingId=ref(''); const editDate=ref(''); const editTime=ref(''); const editCar=ref(''); const editSlots=ref<string[]>([]); const editLoading=ref(false); const editSaving=ref(false); const logoutLoading=ref(false)
const editMinDate = computed(() => minBookingDate())
const editMaxDate = computed(() => maxBookingDate())

async function addCar(){error.value='';try{await $fetch('/api/cars',{method:'POST',body:{make:make.value,model:model.value}});model.value='';await refreshCars()}catch(e:any){error.value=e?.data?.statusMessage==='CAR_LIMIT_REACHED'?t('carLimit'):e?.statusCode===503?t('dbUnavailable'):t('bookingFailed')}}

async function cancelBooking(id:string){try{await $fetch(`/api/bookings/${id}`,{method:'DELETE'});await refreshBookings()}catch(e:any){error.value=t('bookingFailed')}}

async function logout(){
  if(logoutLoading.value)return
  logoutLoading.value=true
  error.value=''
  try{
    await $fetch('/api/auth/logout',{method:'POST'})
    await navigateTo('/login',{replace:true})
  }catch(e:any){
    error.value=e?.statusCode===503?t('dbUnavailable'):t('bookingFailed')
    logoutLoading.value=false
  }
}

async function loadEditSlots(){
  if(!editDate.value)return
  if(!isWithinBookingWindow(editDate.value)){
    editTime.value=''
    editSlots.value=[]
    error.value=t('bookingWindow')
    return
  }
  editLoading.value=true
  error.value=''
  try{
    const r:any=await $fetch('/api/slots',{query:{date:editDate.value}})
    editSlots.value=[...(r.slots??[])]
    const current = editTime.value
    if(current && !editSlots.value.includes(current)) editSlots.value.push(current)
    editSlots.value.sort()
    if(current && !editSlots.value.includes(current)) editTime.value=''
  }catch(e:any){
    editSlots.value=[]
    error.value=e?.data?.statusMessage==='BOOKING_WINDOW_EXCEEDED'?t('bookingWindow'):e?.statusCode===503?t('dbUnavailable'):t('bookingFailed')
  }finally{editLoading.value=false}
}

async function startEdit(b:any){
  editingId.value=b.id
  editDate.value=String(b.booking_date).slice(0,10)
  editTime.value=String(b.booking_time).slice(0,5)
  editCar.value=b.car_id
  await loadEditSlots()
}

function closeEdit(){editingId.value='';editDate.value='';editTime.value='';editCar.value='';editSlots.value=[]}

async function saveEdit(){
  if(!editingId.value||!editDate.value||!editTime.value||!editCar.value)return
  if(!isWithinBookingWindow(editDate.value)){
    error.value=t('bookingWindow')
    return
  }
  editSaving.value=true
  error.value=''
  try{
    await $fetch(`/api/bookings/${editingId.value}`,{method:'PUT',body:{carId:editCar.value,date:editDate.value,time:editTime.value}})
    closeEdit()
    await refreshBookings()
  }catch(e:any){
    error.value=e?.data?.statusMessage==='SLOT_UNAVAILABLE'?t('slotUnavailable'):e?.data?.statusMessage==='BOOKING_WINDOW_EXCEEDED'?t('bookingWindow'):e?.data?.statusMessage==='BOOKING_CANNOT_BE_EDITED'?t('bookingFailed'):e?.statusCode===503?t('dbUnavailable'):t('bookingFailed')
    await loadEditSlots()
  }finally{editSaving.value=false}
}

watch(make,async m=>{const {vehicleCatalog}=await import('#shared/catalog');models.value=[...(vehicleCatalog as any)[m]||[]]},{immediate:true})
watch(editDate, value => {
  if(value && !isWithinBookingWindow(value)){
    editTime.value=''
    editSlots.value=[]
  }
})
</script>
<template><div><div class="flex items-center justify-between"><div><h1 class="text-3xl font-bold">{{ t('account') }}</h1><p class="mt-1 text-slate-600">{{me?.user?.name}} · {{me?.user?.phone}}</p></div><button type="button" class="rounded-xl border px-4 py-2 disabled:opacity-50" :disabled="logoutLoading" @click="logout">{{ logoutLoading ? t('checkDb') : t('logout') }}</button></div><p v-if="error" class="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{{error}}</p><section class="mt-8"><h2 class="text-xl font-bold">{{ t('myCars') }}</h2><div class="mt-3 grid gap-3 sm:grid-cols-2"><div v-for="car in cars?.cars" :key="car.id" class="rounded-2xl border bg-white p-4"><b>{{car.make}} {{car.model}}</b><p class="text-sm text-slate-500">{{car.category}}</p></div></div><div class="mt-4 rounded-2xl border bg-white p-4"><p class="font-semibold">{{ t('addCar') }}</p><div class="mt-3 grid gap-3 sm:grid-cols-2"><select v-model="make" class="rounded-xl border p-3"><option v-for="b in brands" :key="b">{{b}}</option></select><select v-model="model" class="rounded-xl border p-3"><option value="">{{ t('model') }}</option><option v-for="m in models" :key="m">{{m}}</option></select></div><button class="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-white" @click="addCar">{{ t('addCar') }}</button></div></section><section class="mt-10"><h2 class="text-xl font-bold">{{ t('upcoming') }}</h2><div class="mt-3 space-y-3"><div v-for="b in bookings?.upcoming" :key="b.id" class="rounded-2xl border bg-white p-4"><div class="flex flex-wrap justify-between gap-2"><b>{{b.booking_date}} · {{String(b.booking_time).slice(0,5)}}</b><span>{{(b.price_cents/100).toFixed(0)}} €</span></div><p>{{b.make}} {{b.model}}</p><p class="text-sm text-slate-500">{{b.status}}</p><div v-if="editingId===b.id" class="mt-4 rounded-xl bg-slate-50 p-4"><p class="font-semibold">{{t('editBooking')}}</p><select v-model="editCar" class="mt-3 w-full rounded-xl border p-3"><option v-for="car in cars?.cars" :key="car.id" :value="car.id">{{car.make}} {{car.model}} — {{car.category==='passenger'?'25':car.category==='commercial'?'35':'30'}} €</option></select><input v-model="editDate" type="date" :min="editMinDate" :max="editMaxDate" class="mt-3 w-full rounded-xl border p-3" @change="loadEditSlots"><p class="mt-1 text-xs text-slate-500">{{t('bookingWindow')}}</p><div class="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4"><button v-for="slot in editSlots" :key="slot" type="button" class="rounded-xl border p-2" :class="editTime===slot?'bg-slate-900 text-white':''" @click="editTime=slot">{{slot}}</button></div><p v-if="editLoading" class="mt-2 text-sm text-slate-500">{{t('checkDb')}}</p><div class="mt-4 flex gap-2"><button type="button" class="rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-40" :disabled="editSaving||!editDate||!editTime||!editCar" @click="saveEdit">{{editSaving?t('checkDb'):t('save')}}</button><button type="button" class="rounded-xl border px-4 py-2" :disabled="editSaving" @click="closeEdit">{{t('close')}}</button></div></div><div v-else class="mt-2 flex flex-wrap gap-3"><button class="text-sm underline" @click="startEdit(b)">{{ t('edit') }}</button><button class="text-sm underline" @click="cancelBooking(b.id)">{{ t('cancel') }}</button></div></div><p v-if="!bookings?.upcoming?.length" class="text-slate-500">{{ t('noUpcoming') }}</p></div></section><section class="mt-10"><h2 class="text-xl font-bold">{{ t('history') }}</h2><div class="mt-3 space-y-3"><div v-for="b in bookings?.history" :key="b.id" class="rounded-2xl border bg-white p-4"><div class="flex justify-between"><b>{{b.booking_date}} · {{String(b.booking_time).slice(0,5)}}</b><span>{{(b.price_cents/100).toFixed(0)}} €</span></div><p>{{b.make}} {{b.model}}</p><p class="text-sm text-slate-500">{{b.status}}</p></div><p v-if="!bookings?.history?.length" class="text-slate-500">{{ t('noHistory') }}</p></div></section><NuxtLink to="/booking" class="fixed bottom-6 right-6 rounded-full bg-slate-900 px-5 py-3 font-semibold text-white shadow-lg">{{ t('newBooking') }}</NuxtLink></div></template>