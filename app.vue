<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="border-b bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <NuxtLink to="/" class="text-xl font-bold">BT Automazgātava</NuxtLink>
        <nav class="flex gap-4 text-sm">
          <NuxtLink to="/booking">Online booking</NuxtLink>
          <NuxtLink to="/account">My account</NuxtLink>
          <NuxtLink to="/admin">Admin</NuxtLink>
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-8"><NuxtPage /></main>
  </div>
</template>
