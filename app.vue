<script setup lang="ts">
const { locale, setLocale, languages, t } = useLocale()
const requestFetch = useRequestFetch()
const { data: me } = await useAsyncData('current-user', () => requestFetch('/api/auth/me').catch(() => null))
const isAdmin = computed(() => me.value?.user?.role === 'admin')
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="border-b bg-white">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <NuxtLink to="/" class="text-xl font-bold">BT Automazgātava</NuxtLink>
        <div class="flex items-center gap-4">
          <nav class="flex gap-3 text-sm">
            <NuxtLink to="/booking">{{ t('onlineBooking') }}</NuxtLink>
            <NuxtLink to="/account">{{ t('myAccount') }}</NuxtLink>
            <NuxtLink v-if="isAdmin" to="/admin">{{ t('admin') }}</NuxtLink>
          </nav>
          <label class="flex items-center gap-1 text-xs font-semibold" :aria-label="t('language')">
            <select :value="locale" class="rounded-lg border bg-white px-2 py-1" @change="setLocale(($event.target as HTMLSelectElement).value as 'lv'|'ru'|'en')">
              <option v-for="(label, code) in languages" :key="code" :value="code">{{ label }}</option>
            </select>
          </label>
        </div>
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-8"><NuxtPage /></main>
  </div>
</template>
