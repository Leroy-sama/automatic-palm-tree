// Keep self-check in sync with app/utils/quotes + app/utils/practice
function correctPrefixLength(text, typed) {
  let n = 0
  const limit = Math.min(text.length, typed.length)
  while (n < limit && typed[n] === text[n]) n++
  return n
}

function calcWpm(correctChars, elapsedSec) {
  if (elapsedSec <= 0) return 0
  return Math.max(0, Math.round(correctChars / 5 / (elapsedSec / 60)))
}

function applyKeyStuck(text, typed, key) {
  const expected = text[typed.length]
  if (key !== expected) return typed // stay put
  return typed + key
}

function applyTextHardness(text, { caps, punctuation }) {
  let out = text
  if (!punctuation) {
    out = out.replace(/[^\p{L}\p{N}\s']/gu, '')
    out = out.replace(/\s+/g, ' ').trim()
  }
  if (!caps) out = out.toLowerCase()
  return out
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

assert(correctPrefixLength('hello', '') === 0, 'empty typed')
assert(correctPrefixLength('hello', 'hel') === 3, 'correct prefix')
assert(applyKeyStuck('hello', 'hel', 'x') === 'hel', 'wrong key stays put')
assert(applyKeyStuck('hello', 'hel', 'l') === 'hell', 'correct advances')
assert(calcWpm(50, 60) === 10, '50 chars in 60s = 10 wpm')
assert(calcWpm(50, 120) === 5, 'idle time lowers wpm')
assert(applyTextHardness('Hi, There!', { caps: false, punctuation: false }) === 'hi there', 'hardness')
assert(applyTextHardness('Hi, There!', { caps: true, punctuation: true }) === 'Hi, There!', 'full hardness')

console.log('useTypingEngine progress check: ok')

// ---- practice (mirrors app/utils/practice.ts) ----
const START_KEYS = 'fjdkei'
const UNLOCK_ORDER = 'taonshrlcumwgypbvxqz'
const TARGET_WPM = 35
const MAX_ERR = 0.05
const MIN_SAMPLES = 10
const MAX_SAMPLE_MS = 2000
const EMA = 0.1

function unlockedKeys(s) {
  return START_KEYS + UNLOCK_ORDER.slice(0, s.level)
}
function keyWpm(k) {
  return k && k.n && k.ms ? Math.round(60000 / k.ms / 5) : 0
}
function keyDone(k) {
  return !!k && k.n >= MIN_SAMPLES && keyWpm(k) >= TARGET_WPM && k.err <= MAX_ERR
}
function focusKey(s) {
  const keys = [...unlockedKeys(s)]
  const weak = keys.filter(c => !keyDone(s.stats[c]))
  const pool = weak.length ? weak : keys
  return pool.reduce((a, b) => (keyWpm(s.stats[b]) < keyWpm(s.stats[a]) ? b : a))
}
function recordKey(s, key, ok, ms) {
  const k = (s.stats[key] ??= { n: 0, ms: 0, err: 0 })
  k.err = k.err * (1 - EMA) + (ok ? 0 : EMA)
  if (!ok || ms === null || ms > MAX_SAMPLE_MS) return
  k.ms = k.n ? k.ms * (1 - EMA) + ms * EMA : ms
  k.n++
}
function maybeUnlock(s) {
  if (s.level >= UNLOCK_ORDER.length) return null
  if (![...unlockedKeys(s)].every(c => keyDone(s.stats[c]))) return null
  return UNLOCK_ORDER[s.level++]
}

const s = { level: 0, stats: {} }
assert(unlockedKeys(s) === START_KEYS, 'start keys')
assert(focusKey(s) === START_KEYS[0], 'unseen focus is first start key')

for (const c of START_KEYS) {
  for (let i = 0; i < 12; i++) recordKey(s, c, true, 60000 / 5 / TARGET_WPM)
  assert(keyDone(s.stats[c]), `key ${c} done`)
}
const unlocked = maybeUnlock(s)
assert(unlocked === UNLOCK_ORDER[0], 'unlock first remaining letter')
assert(s.level === 1, 'level bumped')
assert(unlockedKeys(s).includes(UNLOCK_ORDER[0]), 'new key in pool')
assert(focusKey(s) === UNLOCK_ORDER[0], 'focus moves to new letter')

const slow = { level: 0, stats: {} }
for (const c of START_KEYS) {
  for (let i = 0; i < 12; i++) recordKey(slow, c, true, 200)
}
recordKey(slow, START_KEYS[0], false, null)
assert(maybeUnlock(slow) === null, 'errors block unlock')
assert(keyWpm({ n: 1, ms: 240, err: 0 }) === 50, '240ms ≈ 50 wpm')

console.log('practice check: ok')
