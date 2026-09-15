import { clearSession } from '../../auth'

export default defineEventHandler(async event => {
  clearSession(event)
  return { ok: true }
})
