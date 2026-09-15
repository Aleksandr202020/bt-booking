import { z } from 'zod'
import { requireUser } from '../../auth'
import { dbQuery } from '../../db'
import { categoryForVehicle } from '../../../shared/catalog'

const schema = z.object({ make: z.string().trim().min(1).max(60), model: z.string().trim().min(1).max(80) })

export default defineEventHandler(async event => {
  const user = await requireUser(event)
  const body = schema.parse(await readBody(event))
  const category = categoryForVehicle(body.make, body.model)
  const result = await dbQuery('INSERT INTO cars (user_id,make,model,category) VALUES ($1,$2,$3,$4) RETURNING id,make,model,category', [user.id, body.make, body.model, category])
  return { car: result.rows[0] }
})
