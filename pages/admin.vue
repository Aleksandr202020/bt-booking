<script setup lang="ts">
const { t } = useLocale()
const today = new Date().toISOString().slice(0,10)
const date=ref(today)
const to=ref(today)
const bookings=ref<any[]>([])
const blocks=ref<any[]>([])
const users=ref<any[]>([])
const error=ref('')
const loading=ref(false)
const activeTab=ref<'calendar'|'bookings'|'manual'|'blocks'>('calendar')
const editing=ref<any|null>(null)
const editDate=ref(''); const editTime=ref(''); const editCarId=ref('')
const manualUserId=ref(''); const manualCarId=ref(''); const manualDate=ref(today); const manualTime=ref('09:00')
const blockDate=ref(today); const blockTime=ref(''); const blockReason=ref('')
const slots=Array.from({length:12},(_,i)=>`${String(i+9).padStart(2,'0')}:00`)

const selectedUser=computed(()=>users.value.find(u=>u.id===manualUserId.value))
const selectedEditBooking=computed(()=>editing.value)
const selectedEditCars=computed(()=>{const u=users.value.find(x=>x.id===editing.value?.user_id); return u?.cars??[]})

async function load(){
  loading.value=true; error.value=''
  try{
    const [b,bl,u]=await Promise.all([
      $fetch<any>('/api/admin/bookings',{query:{from:date.value,to:to.value}}),
      $fetch<any>('/api/admin/blocks',{query:{from:date.value,to:to.value}}),
      users.value.length?$fetch<any>('/api/admin/users'):Promise.resolve({users:users.value})
    ])
    bookings.value=b.bookings; blocks.value=bl.blocks; users.value=u.users
  }catch(e:any){error.value=e?.statusCode===401?t('needLogin'):e?.statusCode===403?t('noAdminAccess'):e?.statusCode===503?t('dbUnavailable'):t('loadFailed')}finally{loading.value=false}
}
async function loadUsers(){try{const r:any=await $fetch('/api/admin/users');users.value=r.users}catch(e:any){error.value=t('loadFailed')}}
function startEdit(b:any){editing.value=b;editDate.value=String(b.booking_date).slice(0,10);editTime.value=String(b.booking_time).slice(0,5);editCarId.value=b.car_id}
function closeEdit(){editing.value=null}
async function saveEdit(){if(!editing.value)return; error.value='';try{await $fetch(`/api/admin/bookings/${editing.value.id}`,{method:'PATCH',body:{date:editDate.value,time:editTime.value,carId:editCarId.value}});editing.value=null;await load()}catch(e:any){error.value=e?.data?.statusMessage==='SLOT_UNAVAILABLE'?t('slotUnavailable'):e?.statusCode===409?t('slotUnavailable'):t('bookingFailed')}}
async function changeStatus(id:string,status:string){try{await $fetch(`/api/admin/bookings/${id}`,{method:'PATCH',body:{status}});await load()}catch(e:any){error.value=t('bookingFailed')}}
async function createManual(){error.value='';try{await $fetch('/api/admin/bookings',{method:'POST',body:{userId:manualUserId.value,carId:manualCarId.value,date:manualDate.value,time:manualTime.value,status:'confirmed'}});await load();activeTab.value='calendar';manualUserId.value='';manualCarId.value=''}catch(e:any){error.value=e?.data?.statusMessage==='SLOT_UNAVAILABLE'?t('slotUnavailable'):t('bookingFailed')}}
async function addBlock(){error.value='';try{await $fetch('/api/admin/blocks',{method:'POST',body:{date:blockDate.value,time:blockTime.value||null,reason:blockReason.value}});blockReason.value='';blockTime.value='';await load()}catch(e:any){error.value=e?.data?.statusMessage==='BLOCK_ALREADY_EXISTS'?'This time is already blocked.':t('bookingFailed')}}
async function removeBlock(id:string){try{await $fetch(`/api/admin/blocks/${id}`,{method:'DELETE'});await load()}catch(e:any){error.value=t('bookingFailed')}}
watch(manualUserId,()=>{manualCarId.value=selectedUser.value?.cars?.[0]?.id??''})
watch(editing,()=>{if(editing.value){const u=users.value.find(x=>x.id===editing.value.user_id);if(!editCarId.value)editCarId.value=u?.cars?.[0]?.id??''}})
await load()
</script>

<template>
<div class="mx-auto max-w-7xl space-y-6">
  <header class="rounded-2xl border bg-white p-5 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-4"><div><h1 class="text-3xl font-bold">{{t('adminPanel')}}</h1><p class="text-slate-600">BT Automazgātava · {{t('manageBookings')}}</p></div><button class="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white" @click="load">{{t('refresh')}}</button></div>
    <div class="mt-5 flex flex-wrap gap-2"><button v-for="tab in ['calendar','bookings','manual','blocks']" :key="tab" type="button" class="rounded-xl px-4 py-2 font-semibold" :class="activeTab===tab?'bg-slate-900 text-white':'border bg-white'" @click="activeTab=tab as any; tab==='manual'&&loadUsers()">{{tab==='calendar'?'Calendar':tab==='bookings'?'All bookings':tab==='manual'?'Manual booking':'Blocked time'}}</button></div>
  </header>
  <p v-if="error" class="rounded-xl bg-red-50 p-3 text-red-700">{{error}}</p>

  <section v-if="activeTab==='calendar'" class="space-y-4">
    <div class="flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-4"><div><label class="text-sm font-semibold">{{t('date')}}</label><input v-model="date" type="date" class="mt-1 rounded-xl border p-3" @change="to=date;load()"></div><div><label class="text-sm font-semibold">To</label><input v-model="to" type="date" class="mt-1 rounded-xl border p-3" @change="load"></div></div>
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"><div v-for="slot in slots" :key="slot" class="min-h-32 rounded-2xl border bg-white p-4"><div class="flex items-center justify-between"><b class="text-lg">{{slot}}</b><span v-if="blocks.some(x=>!x.booking_time||String(x.booking_time).slice(0,5)===slot)" class="rounded-full bg-slate-200 px-2 py-1 text-xs">BLOCKED</span></div><template v-if="bookings.find(x=>String(x.booking_time).slice(0,5)===slot)"><div v-for="b in bookings.filter(x=>String(x.booking_time).slice(0,5)===slot)" :key="b.id" class="mt-3"><b>{{b.make}} {{b.model}}</b><p class="text-sm">{{b.name}}</p><p class="text-sm text-slate-500">{{(b.price_cents/100).toFixed(0)}} € · {{b.status}}</p><button class="mt-2 text-sm underline" @click="startEdit(b)">Edit</button></div></template><p v-else-if="!blocks.some(x=>!x.booking_time||String(x.booking_time).slice(0,5)===slot)" class="mt-6 text-sm text-emerald-700">FREE</p></div></div>
  </section>

  <section v-if="activeTab==='bookings'" class="rounded-2xl border bg-white p-4">
    <div class="mb-4 flex flex-wrap gap-3"><input v-model="date" type="date" class="rounded-xl border p-3"><input v-model="to" type="date" class="rounded-xl border p-3"><button class="rounded-xl bg-slate-900 px-4 py-2 text-white" @click="load">{{t('refresh')}}</button></div>
    <div class="space-y-3"><article v-for="b in bookings" :key="b.id" class="rounded-2xl border p-4"><div class="flex flex-wrap justify-between gap-2"><b>{{b.booking_date}} · {{String(b.booking_time).slice(0,5)}}</b><b>{{(b.price_cents/100).toFixed(0)}} €</b></div><p class="mt-1 font-semibold">{{b.name}} · {{b.phone}}</p><p>{{b.make}} {{b.model}}</p><div class="mt-3 flex flex-wrap items-center gap-2"><select class="rounded-xl border p-2" :value="b.status" @change="changeStatus(b.id,($event.target as HTMLSelectElement).value)"><option>pending</option><option>confirmed</option><option>completed</option><option>cancelled_admin</option><option>no_show</option></select><button class="rounded-xl border px-3 py-2" @click="startEdit(b)">Edit</button></div></article><p v-if="!loading&&!bookings.length" class="py-6 text-center text-slate-500">{{t('noBookings')}}</p></div>
  </section>

  <section v-if="activeTab==='manual'" class="max-w-xl rounded-2xl border bg-white p-5"><h2 class="text-xl font-bold">Manual booking</h2><p class="mt-1 text-sm text-slate-500">Create a booking for a phone/in-person customer.</p><div class="mt-5 space-y-3"><select v-model="manualUserId" class="w-full rounded-xl border p-3"><option value="">Select customer</option><option v-for="u in users" :key="u.id" :value="u.id">{{u.name}} · {{u.phone}}</option></select><select v-model="manualCarId" class="w-full rounded-xl border p-3" :disabled="!selectedUser"><option value="">Select car</option><option v-for="c in selectedUser?.cars??[]" :key="c.id" :value="c.id">{{c.make}} {{c.model}}</option></select><input v-model="manualDate" type="date" class="w-full rounded-xl border p-3"><select v-model="manualTime" class="w-full rounded-xl border p-3"><option v-for="s in slots" :key="s">{{s}}</option></select><button class="w-full rounded-xl bg-slate-900 p-3 font-semibold text-white disabled:opacity-40" :disabled="!manualUserId||!manualCarId||!manualDate||!manualTime" @click="createManual">Create booking</button></div></section>

  <section v-if="activeTab==='blocks'" class="space-y-4"><div class="max-w-xl rounded-2xl border bg-white p-5"><h2 class="text-xl font-bold">Block time</h2><div class="mt-4 space-y-3"><input v-model="blockDate" type="date" class="w-full rounded-xl border p-3"><select v-model="blockTime" class="w-full rounded-xl border p-3"><option value="">Whole day</option><option v-for="s in slots" :key="s">{{s}}</option></select><input v-model="blockReason" class="w-full rounded-xl border p-3" placeholder="Reason"><button class="w-full rounded-xl bg-slate-900 p-3 font-semibold text-white" @click="addBlock">Block</button></div></div><div class="space-y-2"> <article v-for="b in blocks" :key="b.id" class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4"><div><b>{{b.booking_date}} · {{b.booking_time?String(b.booking_time).slice(0,5):'WHOLE DAY'}}</b><p class="text-sm text-slate-500">{{b.reason||'—'}}</p></div><button class="rounded-xl border px-3 py-2" @click="removeBlock(b.id)">Remove</button></article></div></section>

  <div v-if="editing" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="closeEdit"><div class="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"><div class="flex justify-between"><h2 class="text-xl font-bold">Edit booking</h2><button @click="closeEdit">✕</button></div><p class="mt-1 text-sm text-slate-500">{{selectedEditBooking.name}} · {{selectedEditBooking.phone}}</p><div class="mt-5 space-y-3"><input v-model="editDate" type="date" class="w-full rounded-xl border p-3"><select v-model="editTime" class="w-full rounded-xl border p-3"><option v-for="s in slots" :key="s">{{s}}</option></select><select v-model="editCarId" class="w-full rounded-xl border p-3"><option v-for="c in selectedEditCars" :key="c.id" :value="c.id">{{c.make}} {{c.model}}</option></select><div class="flex gap-2"><button class="flex-1 rounded-xl border p-3" @click="closeEdit">{{t('cancel')}}</button><button class="flex-1 rounded-xl bg-slate-900 p-3 font-semibold text-white" @click="saveEdit">Save</button></div></div></div></div>
</div>
</template>
