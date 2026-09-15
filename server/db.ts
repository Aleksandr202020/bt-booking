import { Pool } from 'pg'

let pool: Pool | undefined

export class DatabaseUnavailableError extends Error {
  constructor() {
    super('DATABASE_UNAVAILABLE')
    this.name = 'DatabaseUnavailableError'
  }
}

function getPool() {
  const config = useRuntimeConfig()
  if (!config.databaseUrl) throw new DatabaseUnavailableError()
  if (!pool) {
    pool = new Pool({ connectionString: config.databaseUrl, max: 5, connectionTimeoutMillis: 5000 })
  }
  return pool
}

export async function dbQuery<T extends Record<string, unknown> = Record<string, unknown>>(text: string, values: unknown[] = []) {
  try {
    return await getPool().query<T>(text, values)
  } catch (error) {
    console.error('[DB] Database operation failed', error instanceof Error ? error.name : 'unknown')
    throw new DatabaseUnavailableError()
  }
}

export async function dbHealth() {
  await dbQuery('SELECT 1 AS ok')
  return true
}
