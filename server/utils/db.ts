import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import * as schema from '../database/schema'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

function resolveDbUrl() {
  const config = useRuntimeConfig()
  let url = (config.tursoDatabaseUrl as string) || 'file:./.data/local.db'
  const authToken = (config.tursoAuthToken as string) || ''

  // Remote Turso without a token always 500s — fall back to local so dev keeps working
  if (url.startsWith('libsql://') && !authToken) {
    console.warn(
      '[db] NUXT_TURSO_DATABASE_URL is remote but NUXT_TURSO_AUTH_TOKEN is empty — using file:./.data/local.db',
    )
    url = 'file:./.data/local.db'
  }

  return { url, authToken: authToken || undefined }
}

export function useDb() {
  if (_db) return _db

  const { url, authToken } = resolveDbUrl()

  if (url.startsWith('file:')) {
    const filePath = url.replace(/^file:/, '')
    mkdirSync(dirname(filePath), { recursive: true })
  }

  const client = createClient(authToken ? { url, authToken } : { url })
  _db = drizzle(client, { schema })
  return _db
}
