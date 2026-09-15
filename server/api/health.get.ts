import { dbHealth, DatabaseUnavailableError } from '../db'

export default defineEventHandler(async event => {
  try {
    await dbHealth()
    return { ok: true, database: 'online' }
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      throw createError({ statusCode: 503, statusMessage: 'DATABASE_UNAVAILABLE' })
    }
    throw error
  }
})
