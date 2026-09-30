import { eq } from 'drizzle-orm'
import { lobbies } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const roomId = getRouterParam(event, 'roomId')?.trim()
  if (!roomId || roomId.length > 32) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid room id' })
  }

  const body = await readBody<{
    hostName?: string
    playerCount?: number
    status?: string
  }>(event)

  const status = body.status === 'closed' ? 'closed' : 'open'
  const hostName = String(body.hostName || 'Host').slice(0, 24)
  const playerCount =
    typeof body.playerCount === 'number' && Number.isFinite(body.playerCount)
      ? Math.max(0, Math.min(8, Math.floor(body.playerCount)))
      : 1
  const updatedAt = Date.now()
  const db = useDb()

  const existing = await db
    .select({ roomId: lobbies.roomId })
    .from(lobbies)
    .where(eq(lobbies.roomId, roomId))
    .limit(1)

  if (existing[0]) {
    await db
      .update(lobbies)
      .set({ hostName, playerCount, status, updatedAt })
      .where(eq(lobbies.roomId, roomId))
  } else {
    await db.insert(lobbies).values({ roomId, hostName, playerCount, status, updatedAt })
  }

  return { ok: true }
})
