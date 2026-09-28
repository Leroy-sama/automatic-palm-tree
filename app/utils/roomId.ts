/** Pull a room id from a pasted link or bare code. */
export function parseRoomId(input: string): string | null {
  const raw = input.trim()
  if (!raw) return null

  // Full URL: https://example.com/race/AbCd1234?...
  try {
    if (/^https?:\/\//i.test(raw)) {
      const url = new URL(raw)
      const m = url.pathname.match(/\/race\/([^/]+)/i)
      if (m?.[1]) return sanitizeRoomId(decodeURIComponent(m[1]))
    }
  } catch {
    /* not a URL */
  }

  // Path only: /race/AbCd1234
  const pathMatch = raw.match(/\/race\/([^/?#]+)/i)
  if (pathMatch?.[1]) return sanitizeRoomId(decodeURIComponent(pathMatch[1]))

  // Bare code
  return sanitizeRoomId(raw)
}

function sanitizeRoomId(id: string): string | null {
  const cleaned = id.trim().replace(/[^a-zA-Z0-9_-]/g, '')
  if (cleaned.length < 4 || cleaned.length > 32) return null
  return cleaned
}
