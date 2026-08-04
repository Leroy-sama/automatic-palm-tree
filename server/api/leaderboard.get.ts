import { desc, eq } from 'drizzle-orm'
import { scores, users } from '../database/schema'

export default defineEventHandler(async () => {
  const db = useDb()

  const rows = await db
    .select({
      id: scores.id,
      userId: scores.userId,
      wpm: scores.wpm,
      accuracy: scores.accuracy,
      timeMs: scores.timeMs,
      mode: scores.mode,
      username: users.username,
      createdAt: scores.createdAt,
    })
    .from(scores)
    .innerJoin(users, eq(scores.userId, users.id))
    .orderBy(desc(scores.wpm), desc(scores.createdAt))

  // One personal best per user (highest WPM; newest wins ties)
  const seen = new Set<string>()
  const best = []
  for (const row of rows) {
    if (seen.has(row.userId)) continue
    seen.add(row.userId)
    best.push(row)
    if (best.length >= 50) break
  }

  return best
})
