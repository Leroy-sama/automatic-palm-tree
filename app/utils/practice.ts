import { WORDS } from './words'

// keybr-style adaptive practice: unlock letters one at a time, drill the weakest one.

/** Home-position index/middle fingers + their top-row vowels, so fake words work from session one. */
export const START_KEYS = 'fjdkei'
/** Remaining letters, most common first. */
export const UNLOCK_ORDER = 'taonshrlcumwgypbvxqz'
/** Pass when recent accuracy ≥ 90% (err ≤ 0.10). */
export const MAX_ERR = 0.1
export const MIN_SAMPLES = 10
/** Prefer real English words once this many letters are unlocked. */
export const REAL_WORD_MIN_KEYS = 10
const REAL_WORD_MIN_POOL = 15
/** Gaps longer than this are pauses, not typing speed. */
export const MAX_SAMPLE_MS = 2000

/** ms / err are moving averages so recent typing counts more than old sessions. */
export type KeyStat = { n: number; ms: number; err: number }
export type PracticeState = { level: number; stats: Record<string, KeyStat> }

export const NEW_STATE = (): PracticeState => ({ level: 0, stats: {} })

const EMA = 0.1

export function unlockedKeys(s: PracticeState): string {
  return START_KEYS + UNLOCK_ORDER.slice(0, s.level)
}

export function keyAcc(k?: KeyStat): number {
  return k ? Math.round(100 * (1 - k.err)) : 0
}

export function keyDone(k?: KeyStat): boolean {
  return !!k && k.n >= MIN_SAMPLES && k.err <= MAX_ERR
}

/** Weakest unlocked key: unseen / lowest accuracy first. */
export function focusKey(s: PracticeState): string {
  const keys = [...unlockedKeys(s)]
  const weak = keys.filter(c => !keyDone(s.stats[c]))
  const pool = weak.length ? weak : keys
  return pool.reduce((a, b) => (keyAcc(s.stats[b]) < keyAcc(s.stats[a]) ? b : a))
}

/** One keystroke on `key`. ms = time since previous keystroke (null for first key). */
export function recordKey(s: PracticeState, key: string, ok: boolean, ms: number | null) {
  const k = (s.stats[key] ??= { n: 0, ms: 0, err: 0 })
  k.err = k.err * (1 - EMA) + (ok ? 0 : EMA)
  if (!ok || ms === null || ms > MAX_SAMPLE_MS) return
  k.ms = k.n ? k.ms * (1 - EMA) + ms * EMA : ms
  k.n++
}

/** Unlock the next letter once every unlocked one hits target. Returns the new letter, if any. */
export function maybeUnlock(s: PracticeState): string | null {
  if (s.level >= UNLOCK_ORDER.length) return null
  if (![...unlockedKeys(s)].every(c => keyDone(s.stats[c]))) return null
  return UNLOCK_ORDER[s.level++]!
}

// ponytail: letter-pair model from WORDS; fake words only until enough keys unlock.
const CHAIN: Record<string, string> = {}
for (const w of WORDS) {
  const s = ' ' + w
  for (let i = 0; i < s.length - 1; i++) CHAIN[s[i]!] = (CHAIN[s[i]!] ?? '') + s[i + 1]
}

/** Pronounceable-ish fake word using only `allowed` letters, containing `focus`. */
export function fakeWord(allowed: string, focus: string, rand = Math.random): string {
  const pick = (pool: string) => pool[Math.floor(rand() * pool.length)]!
  for (let tries = 0; ; tries++) {
    const len = 3 + Math.floor(rand() * 4)
    let w = ''
    while (w.length < len) {
      const next = [...(CHAIN[w.at(-1) ?? ' '] ?? '')].filter(c => allowed.includes(c)).join('')
      w += pick(next || allowed)
    }
    if (w.includes(focus)) return w
    if (tries >= 20) {
      const i = Math.floor(rand() * w.length)
      return w.slice(0, i) + focus + w.slice(i + 1)
    }
  }
}

export function realWordsFor(allowed: string, focus: string): string[] {
  const escaped = [...allowed].map(c => (/[[\]\\^$-]/.test(c) ? `\\${c}` : c)).join('')
  const ok = new RegExp(`^[${escaped}]+$`)
  return WORDS.filter(w => w.includes(focus) && ok.test(w))
}

/** Build drill text. `focusPool` = unlocked letters to rotate as focus; empty → auto weakest. */
export function practiceText(
  s: PracticeState,
  words = 15,
  rand = Math.random,
  focusPool = '',
): string {
  const allowed = unlockedKeys(s)
  const picks = [...focusPool].filter(c => allowed.includes(c))
  const pool = picks.length ? picks : [focusKey(s)]
  const useReal = allowed.length >= REAL_WORD_MIN_KEYS

  return Array.from({ length: words }, () => {
    const focus = pool[Math.floor(rand() * pool.length)]!
    if (useReal) {
      const matches = realWordsFor(allowed, focus)
      if (matches.length >= REAL_WORD_MIN_POOL) {
        return matches[Math.floor(rand() * matches.length)]!
      }
    }
    return fakeWord(allowed, focus, rand)
  }).join(' ')
}
