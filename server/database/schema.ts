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
