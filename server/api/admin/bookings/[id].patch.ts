import { z } from 'zod'
import { requireAdmin } from '../../../auth'
import { dbQuery, DatabaseQueryError } from '../../../db'
import { generateSlots } from '../../../../shared/slots'
import { priceCentsForCategory } from '../../../../shared/catalog'

const schema=z.object({
  status:z.enum(['pending','confirmed','completed','cancelled_customer','cancelled_admin','no_show']).optional(),
  date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time:z.string().regex(/^\d{2}:00$/).optional(),
  carId:z.string().uuid().optional()
})
export default defineEventHandler(async event=>{
  await requireAdmin(event)
  const id=getRouterParam(event,'id')
  if(!id) throw createError({statusCode:400,statusMessage:'BOOKING_ID_REQUIRED'})
  const body=schema.parse(await readBody(event))
  const current=await dbQuery<any>('SELECT id,user_id,car_id,booking_date,booking_time,status FROM bookings WHERE id=$1',[id])
  const row=current.rows[0]
  if(!row) throw createError({statusCode:404,statusMessage:'BOOKING_NOT_FOUND'})
  const date=body.date??String(row.booking_date).slice(0,10)
  const time=body.time??String(row.booking_time).slice(0,5)
  const carId=body.carId??row.car_id
  if((body.date||body.time||body.carId) && !generateSlots(date).includes(time)) throw createError({statusCode:400,statusMessage:'INVALID_SLOT'})
  if(body.date||body.time||body.carId){
    const car=await dbQuery<any>('SELECT id,category FROM cars WHERE id=$1 AND user_id=$2',[carId,row.user_id])
    if(!car.rows[0]) throw createError({statusCode:404,statusMessage:'CAR_NOT_FOUND'})
    const price=priceCentsForCategory(car.rows[0].category)
    try {
      const updated=await dbQuery(`UPDATE bookings SET booking_date=$1,booking_time=$2,car_id=$3,price_cents=$4,status=COALESCE($5,status),updated_at=now() WHERE id=$6 AND NOT EXISTS (SELECT 1 FROM blocked_slots WHERE booking_date=$1 AND (booking_time=$2 OR booking_time IS NULL)) RETURNING id,booking_date,booking_time,car_id,price_cents,status`,[date,time,carId,price,body.status??null,id])
      if(!updated.rows[0]) throw createError({statusCode:409,statusMessage:'SLOT_UNAVAILABLE'})
      return {booking:updated.rows[0]}
    } catch(error){
      if(error instanceof DatabaseQueryError && error.code==='23505') throw createError({statusCode:409,statusMessage:'SLOT_UNAVAILABLE'})
      throw error
    }
  }
  const updated=await dbQuery('UPDATE bookings SET status=$1,updated_at=now() WHERE id=$2 RETURNING id,status',[body.status,id])
  if(!updated.rows[0]) throw createError({statusCode:404,statusMessage:'BOOKING_NOT_FOUND'})
  return {booking:updated.rows[0]}
})
