import { requireAdmin } from '../../auth'
import { dbQuery } from '../../db'

export default defineEventHandler(async event => {
  await requireAdmin(event)
  const q=getQuery(event)
  const from=typeof q.from==='string'?q.from:new Date().toISOString().slice(0,10)
  const to=typeof q.to==='string'?q.to:from
  const result=await dbQuery('SELECT id,booking_date,booking_time,reason FROM blocked_slots WHERE booking_date BETWEEN $1 AND $2 ORDER BY booking_date,booking_time NULLS FIRST',[from,to])
  return {blocks:result.rows}
})
