import { z } from 'zod'
import { requireUser } from '../../auth'
import { dbQuery } from '../../db'
import { categoryForVehicle } from '../../../shared/catalog'

const MAX_CUSTOMER_CARS = 10

const schema = z.object({ make: z.string().trim().min(1).max(60), model: z.string().trim().min(1).max(80) })

export default defineEventHandler(async event => {
  const user = await requireUser(event)
  const body = schema.parse(await readBody(event))

  // Corporate/admin accounts are not subject to the regular customer limit.
  if (user.role !== 'admin') {
    const countResult = await dbQuery<{ count: number }>(
      'SELECT COUNT(*)::int AS count FROM cars WHERE user_id = $1',
      [user.id]
    )

    if (countResult.rows[0]?.count >= MAX_CUSTOMER_CARS) {
      throw createError({
        statusCode: 409,
        statusMessage: 'CAR_LIMIT_REACHED'
      })
    }
  }

  const category = categoryForVehicle(body.make, body.model)
  const result = await dbQuery(
    'INSERT INTO cars (user_id,make,model,category) VALUES ($1,$2,$3,$4) RETURNING id,make,model,category',
    [user.id, body.make, body.model, category]
  )

  return { car: result.rows[0] }
})
