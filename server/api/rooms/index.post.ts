import { nanoid } from 'nanoid'

export default defineEventHandler(() => {
  return { roomId: nanoid(8) }
})
