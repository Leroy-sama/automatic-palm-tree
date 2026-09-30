import { eq } from 'drizzle-orm'
import { practiceProgress } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const db = useDb()
  const rows = await db
    .select()
    .from(practiceProgress)
    .where(eq(practiceProgress.userId, user.id))
    .limit(1)

  const row = rows[0]
  if (!row) {
    return { level: 0, stats: {} as Record<string, { n: number; ms: number; err: number }> }
  }

  let stats: Record<string, { n: number; ms: number; err: number }> = {}
  try {
    stats = JSON.parse(row.stats)
  } catch {
    stats = {}
  }
  return { level: row.level, stats }
})
