import { and, eq, gt } from 'drizzle-orm'
import { lobbies } from '../../database/schema'

const STALE_MS = 90_000

export default defineEventHandler(async () => {
  const db = useDb()
  const cutoff = Date.now() - STALE_MS
  const rows = await db
    .select()
    .from(lobbies)
    .where(and(eq(lobbies.status, 'open'), gt(lobbies.updatedAt, cutoff)))

  return rows
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((r) => ({
      roomId: r.roomId,
      hostName: r.hostName,
      playerCount: r.playerCount,
      updatedAt: r.updatedAt,
    }))
})
