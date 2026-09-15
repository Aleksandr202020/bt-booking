import { Pool } from 'pg'

let pool: Pool | undefined

export class DatabaseUnavailableError extends Error {
  constructor() {
    super('DATABASE_UNAVAILABLE')
    this.name = 'DatabaseUnavailableError'
  }
}

export class DatabaseQueryError extends Error {
  readonly code?: string
  constructor(message: string, code?: string) {
    super(message)
    this.name = 'DatabaseQueryError'
    this.code = code
  }
}

function getPool() {
  const config = useRuntimeConfig()
  if (!config.databaseUrl) throw new DatabaseUnavailableError()
  if (!pool) pool = new Pool({ connectionString: config.databaseUrl, max: 5, connectionTimeoutMillis: 5000 })
  return pool
}

export async function dbQuery<T extends Record<string, unknown> = Record<string, unknown>>(text: string, values: unknown[] = []) {
  try {
    return await getPool().query<T>(text, values)
  } catch (error: any) {
    const code = error?.code as string | undefined
    const connectionFailure = ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', '57P01', '57P02', '57P03'].includes(code ?? '')
    if (connectionFailure || !code) {
      console.error('[DB] Database operation unavailable', code ?? 'unknown')
      throw new DatabaseUnavailableError()
    }
    console.error('[DB] Database query failed', code)
    throw new DatabaseQueryError('DATABASE_QUERY_FAILED', code)
  }
}

export async function dbHealth() {
  await dbQuery('SELECT 1 AS ok')
  return true
}
