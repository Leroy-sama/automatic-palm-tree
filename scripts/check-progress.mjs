// Keep self-check in sync with app/utils/quotes + app/utils/practice
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

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
const MAX_ERR = 0.1
const MIN_SAMPLES = 10
const MAX_SAMPLE_MS = 2000
const EMA = 0.1

function unlockedKeys(s) {
  return START_KEYS + UNLOCK_ORDER.slice(0, s.level)
}
function keyAcc(k) {
  return k ? Math.round(100 * (1 - k.err)) : 0
}
function keyDone(k) {
  return !!k && k.n >= MIN_SAMPLES && k.err <= MAX_ERR
}
function focusKey(s) {
  const keys = [...unlockedKeys(s)]
  const weak = keys.filter(c => !keyDone(s.stats[c]))
  const pool = weak.length ? weak : keys
  return pool.reduce((a, b) => (keyAcc(s.stats[b]) < keyAcc(s.stats[a]) ? b : a))
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
  for (let i = 0; i < 12; i++) recordKey(s, c, true, 200)
  assert(keyDone(s.stats[c]), `key ${c} done`)
}
const unlocked = maybeUnlock(s)
assert(unlocked === UNLOCK_ORDER[0], 'unlock first remaining letter')
assert(s.level === 1, 'level bumped')
assert(unlockedKeys(s).includes(UNLOCK_ORDER[0]), 'new key in pool')
assert(focusKey(s) === UNLOCK_ORDER[0], 'focus moves to new letter')

const messy = { level: 0, stats: {} }
for (const c of START_KEYS) {
  for (let i = 0; i < 12; i++) recordKey(messy, c, true, 200)
}
// Enough recent misses that err stays above 10%
for (let i = 0; i < 5; i++) recordKey(messy, START_KEYS[0], false, null)
assert(messy.stats[START_KEYS[0]].err > MAX_ERR, 'err above passmark')
assert(maybeUnlock(messy) === null, 'errors block unlock')
assert(keyAcc({ n: 10, ms: 200, err: 0.1 }) === 90, '90% accuracy')

console.log('practice check: ok')

// Real-word filter / fallback (mirrors practice.ts + words.ts)
const here = dirname(fileURLToPath(import.meta.url))
const wordsSrc = readFileSync(join(here, '../app/utils/words.ts'), 'utf8')
const wordBlob = wordsSrc.match(/`([\s\S]*?)`/)?.[1] || ''
const WORDS = wordBlob.trim().split(/\s+/).filter((w, i, a) => /^[a-z]+$/.test(w) && a.indexOf(w) === i)
assert(WORDS.length > 200, 'word list loaded')

function realWordsFor(allowed, focus) {
  const escaped = [...allowed].map(c => (/[[\]\\^$-]/.test(c) ? `\\${c}` : c)).join('')
  const ok = new RegExp(`^[${escaped}]+$`)
  return WORDS.filter(w => w.includes(focus) && ok.test(w))
}

const early = realWordsFor(START_KEYS, 'f')
assert(early.length < 15, 'early keys have few real words → fake fallback')
const laterAllowed = START_KEYS + UNLOCK_ORDER.slice(0, 8)
assert(laterAllowed.length >= 10, 'later pool unlocks real-word mode')
const later = realWordsFor(laterAllowed, 't')
assert(later.length >= 15, 'enough real words once keys unlock')
assert(later.every(w => [...w].every(c => laterAllowed.includes(c))), 'real words stay in charset')

console.log('words check: ok')
