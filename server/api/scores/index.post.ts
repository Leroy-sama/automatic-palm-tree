import { and, desc, eq, ne } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { scores } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const body = await readBody<{
    mode?: string
    wpm?: number
    accuracy?: number
    timeMs?: number
    quoteText?: string
    roomId?: string
  }>(event)

  const mode = body.mode
  const wpm = body.wpm
  const accuracy = body.accuracy
  const timeMs = body.timeMs
  const quoteText = body.quoteText

  if (
    (mode !== 'solo' && mode !== 'multiplayer') ||
    typeof wpm !== 'number' ||
    typeof accuracy !== 'number' ||
    typeof timeMs !== 'number' ||
    typeof quoteText !== 'string'
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid score payload' })
  }

  const db = useDb()
  const next = {
    mode,
    wpm: Math.round(wpm),
    accuracy: Math.round(accuracy),
    timeMs: Math.round(timeMs),
    quoteText,
    roomId: body.roomId ?? null,
    createdAt: Date.now(),
  }

  // One personal best per user — board only shows that until they beat it
  const existing = await db
    .select()
    .from(scores)
    .where(eq(scores.userId, user.id))
    .orderBy(desc(scores.wpm))
    .limit(1)

  const best = existing[0]
  if (!best) {
    const id = nanoid()
    await db.insert(scores).values({ id, userId: user.id, ...next })
    return { id, isNewBest: true, bestWpm: next.wpm }
  }

  if (next.wpm <= best.wpm) {
    return { id: best.id, isNewBest: false, bestWpm: best.wpm }
  }

  await db
    .update(scores)
    .set(next)
    .where(eq(scores.id, best.id))

  // Drop older duplicate rows so the board stays one line per user
  await db
    .delete(scores)
    .where(and(eq(scores.userId, user.id), ne(scores.id, best.id)))

  return { id: best.id, isNewBest: true, bestWpm: next.wpm }
})
