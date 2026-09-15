<script setup lang="ts">
const email = ref(''); const password = ref(''); const error = ref(''); const loading = ref(false)
async function login() {
  error.value = ''; loading.value = true
  try { await $fetch('/api/auth/login', { method: 'POST', body: { email: email.value, password: password.value } }); await navigateTo('/account') }
  catch (e: any) { error.value = e?.data?.statusMessage === 'DATABASE_UNAVAILABLE' || e?.statusCode === 503 ? 'База данных временно недоступна. Попробуйте позже.' : 'Неверный email или пароль.' }
  finally { loading.value = false }
}
</script>
<template><div class="mx-auto max-w-md"><h1 class="text-3xl font-bold">Вход</h1><form class="mt-6 space-y-4" @submit.prevent="login"><input v-model="email" type="email" required placeholder="Email" class="w-full rounded-xl border p-3"><input v-model="password" type="password" required placeholder="Пароль" class="w-full rounded-xl border p-3"><p v-if="error" class="rounded-xl bg-red-50 p-3 text-red-700">{{ error }}</p><button :disabled="loading" class="w-full rounded-xl bg-slate-900 p-3 font-semibold text-white">{{ loading ? 'Вход...' : 'Войти' }}</button></form><p class="mt-4 text-sm">Нет аккаунта? <NuxtLink to="/register" class="underline">Регистрация</NuxtLink></p></div></template>
