import process from 'node:process'
import { defineConfig } from 'drizzle-kit'

/**
 * drizzle-kit runs as a CLI outside the Nuxt app, so process.env is correct here.
 * App/server code must use useRuntimeConfig() instead — same NUXT_* names.
 *
 * dialect: 'turso' (libSQL) — supports file: local DBs and remote libsql:// + authToken.
 * (sqlite dialect rejects authToken in the type definition.)
 */
export default defineConfig({
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.NUXT_TURSO_DATABASE_URL || 'file:./.data/local.db',
    authToken: process.env.NUXT_TURSO_AUTH_TOKEN || undefined,
  },
})
