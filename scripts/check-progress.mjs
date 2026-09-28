// Keep self-check in sync with app/utils/quotes calcWpm + stuck-on-letter rules
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
    out = out.replace(/[^\p{L}\p{N}\s]/gu, '')
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
