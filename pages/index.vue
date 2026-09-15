<script setup lang="ts">
const { t } = useLocale()
</script>

<template>
  <section class="mx-auto max-w-3xl py-12 text-center">
    <p class="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">BT Automazgātava</p>
    <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">{{ t('onlineBooking') }}</h1>
    <p class="mx-auto mt-4 max-w-xl text-lg text-slate-600">{{ t('homeText') }}</p>
    <div class="mt-8 flex justify-center gap-3">
      <NuxtLink to="/register" class="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white">{{ t('createAccount') }}</NuxtLink>
      <NuxtLink to="/booking" class="rounded-xl border bg-white px-5 py-3 font-semibold">{{ t('bookVisit') }}</NuxtLink>
    </div>
    <p class="mt-8 text-sm text-slate-500">{{ t('hours') }}</p>
  </section>
</template>
