import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string; password?: string }>(event)
  const username = body.username?.trim() ?? ''
  const password = body.password ?? ''

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username must be 3–20 chars (letters, numbers, _)',
    })
  }
  if (password.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password must be at least 8 characters',
    })
  }

  const db = useDb()
  const existing = await db.select().from(users).where(eq(users.username, username)).limit(1)
  if (existing.length) {
    throw createError({ statusCode: 409, statusMessage: 'Username taken' })
  }

  const id = nanoid()
  await db.insert(users).values({
    id,
    username,
    passwordHash: hashPassword(password),
    createdAt: Date.now(),
  })

  const token = await signAuthToken({ id, username })
  return { token }
})
