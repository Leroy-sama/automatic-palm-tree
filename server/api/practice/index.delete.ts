import { eq } from 'drizzle-orm'
import { practiceProgress } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const db = useDb()
  await db.delete(practiceProgress).where(eq(practiceProgress.userId, user.id))
  return { ok: true }
})
