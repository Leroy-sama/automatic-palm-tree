import { eq } from 'drizzle-orm'
import { practiceProgress } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const body = await readBody<{
    level?: number
    stats?: Record<string, { n: number; ms: number; err: number }>
  }>(event)

  if (typeof body.level !== 'number' || !Number.isFinite(body.level) || body.level < 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid level' })
  }
  if (!body.stats || typeof body.stats !== 'object' || Array.isArray(body.stats)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid stats' })
  }

  const level = Math.floor(body.level)
  const statsJson = JSON.stringify(body.stats)
  const updatedAt = Date.now()
  const db = useDb()

  const existing = await db
    .select({ userId: practiceProgress.userId })
    .from(practiceProgress)
    .where(eq(practiceProgress.userId, user.id))
    .limit(1)

  if (existing[0]) {
    await db
      .update(practiceProgress)
      .set({ level, stats: statsJson, updatedAt })
      .where(eq(practiceProgress.userId, user.id))
  } else {
    await db.insert(practiceProgress).values({
      userId: user.id,
      level,
      stats: statsJson,
      updatedAt,
    })
  }

  return { ok: true, level, stats: body.stats }
})
