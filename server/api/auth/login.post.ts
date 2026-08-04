import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string; password?: string }>(event)
  const username = body.username?.trim() ?? ''
  const password = body.password ?? ''

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Username and password required' })
  }

  const db = useDb()
  const rows = await db.select().from(users).where(eq(users.username, username)).limit(1)
  const user = rows[0]
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const token = await signAuthToken({ id: user.id, username: user.username })
  return { token }
})
