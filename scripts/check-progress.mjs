function correctPrefixLength(text, typed) {
  let n = 0
  const limit = Math.min(text.length, typed.length)
  while (n < limit && typed[n] === text[n]) n++
  return n
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

assert(correctPrefixLength('hello', '') === 0, 'empty typed')
assert(correctPrefixLength('hello', 'hel') === 3, 'correct prefix')
assert(correctPrefixLength('hello', 'hxllo') === 1, 'mistake stops progress')
assert(correctPrefixLength('hello', 'hello') === 5, 'complete')
assert(correctPrefixLength('hello', 'hellox') === 5, 'extra ignored for prefix')

// step-back on error: wrong key rewinds one correct char (no stuck incorrect span)
function applyKey(text, typed, key) {
  const expected = text[typed.length]
  if (key !== expected) {
    return typed.length > 0 ? typed.slice(0, -1) : typed
  }
  return typed + key
}
assert(applyKey('hello', 'hel', 'x') === 'he', 'wrong key steps back')
assert(applyKey('hello', '', 'x') === '', 'wrong at start stays put')
assert(applyKey('hello', 'hel', 'l') === 'hell', 'correct advances')

console.log('useTypingEngine progress check: ok')
