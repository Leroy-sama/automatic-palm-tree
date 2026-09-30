import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at').notNull(),
})

export const scores = sqliteTable('scores', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  mode: text('mode').notNull(), // solo | multiplayer
  wpm: integer('wpm').notNull(),
  accuracy: integer('accuracy').notNull(),
  timeMs: integer('time_ms').notNull(),
  quoteText: text('quote_text').notNull(),
  roomId: text('room_id'),
  createdAt: integer('created_at').notNull(),
})

export const practiceProgress = sqliteTable('practice_progress', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id),
  level: integer('level').notNull(),
  /** JSON: Record<letter, { n, ms, err }> */
  stats: text('stats').notNull(),
  updatedAt: integer('updated_at').notNull(),
})

export const lobbies = sqliteTable('lobbies', {
  roomId: text('room_id').primaryKey(),
  hostName: text('host_name').notNull(),
  playerCount: integer('player_count').notNull(),
  status: text('status').notNull(), // open | closed
  updatedAt: integer('updated_at').notNull(),
})
