// keybr-style adaptive practice: unlock letters one at a time, drill the weakest one.

/** Home-position index/middle fingers + their top-row vowels, so fake words work from session one. */
export const START_KEYS = 'fjdkei'
/** Remaining letters, most common first. */
export const UNLOCK_ORDER = 'taonshrlcumwgypbvxqz'
export const TARGET_WPM = 35
export const MAX_ERR = 0.05
export const MIN_SAMPLES = 10
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

export function keyWpm(k?: KeyStat): number {
  return k && k.n && k.ms ? Math.round(60000 / k.ms / 5) : 0
}

export function keyDone(k?: KeyStat): boolean {
  return !!k && k.n >= MIN_SAMPLES && keyWpm(k) >= TARGET_WPM && k.err <= MAX_ERR
}

/** Weakest unlocked key: unseen/slow first. */
export function focusKey(s: PracticeState): string {
  const keys = [...unlockedKeys(s)]
  const weak = keys.filter(c => !keyDone(s.stats[c]))
  const pool = weak.length ? weak : keys
  return pool.reduce((a, b) => (keyWpm(s.stats[b]) < keyWpm(s.stats[a]) ? b : a))
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

// ponytail: letter-pair model from a small built-in word list; swap in a bigger corpus if words feel repetitive.
const CORPUS = `the and that have for not with you this but his from they say her she will one all would there
their what out about who get which when make can like time just him know take people into year your good some
could them see other than then now look only come its over think also back after use two how our work first well
way even new want because any these give day most find here thing many tell very through life child world down
side kind hand place feel ask need house high keep old last long great little under never begin seem help talk
turn start might show hear play run move live believe hold bring happen write provide sit stand lose pay meet
include continue set learn change lead understand watch follow stop create speak read spend grow open walk win
offer remember love consider appear buy wait serve die send expect build stay fall cut reach kill remain suggest
raise pass sell require report decide pull join just jump judge joke major enjoy object subject project quick
quite quiet equal question size zero lazy prize freeze box next fix mix exit exact extra taxi fake kid kite desk
risk dark drink quick knife field fried fire ride idea deep feed diet edit`

const CHAIN: Record<string, string> = {}
for (const w of CORPUS.match(/[a-z]+/g)!) {
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

export function practiceText(s: PracticeState, words = 15, rand = Math.random): string {
  const allowed = unlockedKeys(s)
  const focus = focusKey(s)
  return Array.from({ length: words }, () => fakeWord(allowed, focus, rand)).join(' ')
}
