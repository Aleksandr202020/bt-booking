import { requireAdmin } from '../../../auth'
import { dbQuery } from '../../../db'
export default defineEventHandler(async event=>{
  await requireAdmin(event)
  const id=getRouterParam(event,'id')
  if(!id) throw createError({statusCode:400,statusMessage:'BLOCK_ID_REQUIRED'})
  const result=await dbQuery('DELETE FROM blocked_slots WHERE id=$1 RETURNING id',[id])
  if(!result.rows[0]) throw createError({statusCode:404,statusMessage:'BLOCK_NOT_FOUND'})
  return {ok:true}
})
