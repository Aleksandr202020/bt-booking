export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    sessionSecret: process.env.SESSION_SECRET,
    adminEmail: process.env.ADMIN_EMAIL,
    public: {
      businessName: 'BT Automazgātava',
      bookingDurationMinutes: 60
    }
  },
  typescript: { strict: true },
  nitro: {
    routeRules: {
      '/api/**': { cors: true }
    }
  }
})
