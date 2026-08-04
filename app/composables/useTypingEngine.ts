import {
  DIFF,
  type Difficulty,
  type Quote,
  correctPrefixLength,
  pickQuote,
} from '~/utils/quotes'

export type RaceResult = {
  playerWon: boolean
  wpm: number
  accuracy: number
  elapsed: number
  quoteText: string
}

export type PromptChar = {
  ch: string
  kind: 'correct' | 'incorrect' | 'current' | 'pending'
}

function beep(freq: number, dur: number) {
  if (!import.meta.client) return
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    // ponytail: one shared AudioContext would be nicer; recreate is fine for this game
    const audioCtx = new Ctx()
    const o = audioCtx.createOscillator()
    const g = audioCtx.createGain()
    o.type = 'square'
    o.frequency.value = freq
    g.gain.value = 0.04
    o.connect(g)
    g.connect(audioCtx.destination)
    o.start()
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur)
    o.stop(audioCtx.currentTime + dur)
  } catch {
    /* ignore */
  }
}

export function useTypingEngine() {
  const difficulty = ref<Difficulty>('medium')
  const previewQuote = ref<Quote>(pickQuote())
  const quote = ref<Quote | null>(null)
  const typed = ref('')
  const startTime = ref<number | null>(null)
  const endTime = ref<number | null>(null)
  const mistakes = ref(0)
  const totalKeystrokes = ref(0)
  const raceOver = ref(false)
  const cpuFinished = ref(false)
  const playerFinished = ref(false)
  const running = ref(false)
  const screen = ref<'start' | 'game' | 'result'>('start')
  const hudTime = ref(0)
  const hudWpm = ref(0)
  const hudAcc = ref(100)
  const playerPct = ref(0)
  const cpuPct = ref(0)
  const result = ref<RaceResult | null>(null)
  const inputLocked = ref(false)

  let rafId: number | null = null
  let externalQuote: Quote | null = null
  let onProgress: ((pct: number, wpm: number, acc: number) => void) | null = null
  let onFinish: ((r: RaceResult) => void) | null = null
  let cpuEnabled = true

  const promptChars = computed<PromptChar[]>(() => {
    const text = quote.value?.text ?? ''
    const t = typed.value
    return [...text].map((ch, i) => {
      if (i < t.length) {
        return { ch, kind: t[i] === ch ? 'correct' : 'incorrect' }
      }
      if (i === t.length) return { ch, kind: 'current' }
      return { ch, kind: 'pending' }
    })
  })

  function refreshPreview() {
    previewQuote.value = pickQuote()
  }

  function setDifficulty(d: Difficulty) {
    difficulty.value = d
  }

  function configure(opts: {
    quote?: Quote
    cpu?: boolean
    locked?: boolean
    onProgress?: (pct: number, wpm: number, acc: number) => void
    onFinish?: (r: RaceResult) => void
  }) {
    externalQuote = opts.quote ?? null
    cpuEnabled = opts.cpu !== false
    inputLocked.value = !!opts.locked
    onProgress = opts.onProgress ?? null
    onFinish = opts.onFinish ?? null
  }

  function unlockInput() {
    inputLocked.value = false
  }

  function accuracyNow() {
    return totalKeystrokes.value > 0
      ? Math.max(
          0,
          Math.round(
            (100 * (totalKeystrokes.value - mistakes.value)) / totalKeystrokes.value,
          ),
        )
      : 100
  }

  function updatePlayerPosition() {
    const text = quote.value?.text
    if (!text) return
    const correct = correctPrefixLength(text, typed.value)
    const pct = Math.min(1, correct / text.length)
    playerPct.value = pct
    if (pct >= 1 && !playerFinished.value) {
      playerFinished.value = true
      finishRace()
    }
  }

  function tick() {
    if (raceOver.value) return
    if (startTime.value) {
      const elapsed = (performance.now() - startTime.value) / 1000
      hudTime.value = elapsed

      const wordsTyped = typed.value.length / 5
      const minutes = elapsed / 60
      const wpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0
      hudWpm.value = wpm
      hudAcc.value = accuracyNow()

      onProgress?.(playerPct.value, wpm, hudAcc.value)

      if (cpuEnabled && quote.value) {
        const cpuWpm = DIFF[difficulty.value].wpm
        const cpuCharsPerSec = (cpuWpm * 5) / 60
        const cpuChars = Math.min(quote.value.text.length, elapsed * cpuCharsPerSec)
        const pct = cpuChars / quote.value.text.length
        cpuPct.value = pct
        if (pct >= 1 && !cpuFinished.value) {
          cpuFinished.value = true
          if (!playerFinished.value) finishRace()
        }
      }
    }
    rafId = requestAnimationFrame(tick)
  }

  function finishRace() {
    if (raceOver.value) return
    raceOver.value = true
    endTime.value = performance.now()
    running.value = false
    if (rafId) cancelAnimationFrame(rafId)
    rafId = null

    const started = startTime.value ?? endTime.value!
    const elapsed = (endTime.value! - started) / 1000
    const textLen = quote.value?.text.length ?? 0
    const wordsTyped = textLen / 5
    const minutes = elapsed / 60
    const wpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0
    const acc = accuracyNow()
    const playerWon = playerFinished.value

    const r: RaceResult = {
      playerWon,
      wpm,
      accuracy: acc,
      elapsed,
      quoteText: quote.value?.text ?? '',
    }
    result.value = r
    beep(playerWon ? 880 : 220, playerWon ? 0.18 : 0.3)

    setTimeout(() => {
      screen.value = 'result'
      onFinish?.(r)
    }, 350)
  }

  function startRace() {
    quote.value = externalQuote ?? pickQuote()
    typed.value = ''
    startTime.value = null
    endTime.value = null
    mistakes.value = 0
    totalKeystrokes.value = 0
    raceOver.value = false
    cpuFinished.value = false
    playerFinished.value = false
    running.value = false
    playerPct.value = 0
    cpuPct.value = 0
    hudTime.value = 0
    hudWpm.value = 0
    hudAcc.value = 100
    result.value = null
    screen.value = 'game'

    if (rafId) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(tick)
  }

  function backToStart() {
    screen.value = 'start'
    refreshPreview()
  }

  function resetForRematch() {
    screen.value = 'start'
    result.value = null
    raceOver.value = false
    typed.value = ''
    running.value = false
    playerPct.value = 0
    if (rafId) cancelAnimationFrame(rafId)
    rafId = null
  }

  function onKeydown(e: KeyboardEvent) {
    if (raceOver.value || inputLocked.value || screen.value !== 'game') return
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (typed.value.length > 0) {
        typed.value = typed.value.slice(0, -1)
        updatePlayerPosition()
      }
      return
    }
    if (e.key.length !== 1) return
    e.preventDefault()

    if (!startTime.value) {
      startTime.value = performance.now()
      running.value = true
    }

    const expected = quote.value!.text[typed.value.length]
    totalKeystrokes.value++
    if (e.key !== expected) {
      // Mistake: don't append (that stalls until backspace) — step back one char instead
      mistakes.value++
      beep(160, 0.08)
      if (typed.value.length > 0) {
        typed.value = typed.value.slice(0, -1)
      }
      updatePlayerPosition()
      return
    }
    beep(660, 0.04)
    typed.value += e.key
    updatePlayerPosition()
  }

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = null
  }

  return {
    difficulty,
    previewQuote,
    quote,
    typed,
    screen,
    running,
    raceOver,
    hudTime,
    hudWpm,
    hudAcc,
    playerPct,
    cpuPct,
    result,
    promptChars,
    inputLocked,
    refreshPreview,
    setDifficulty,
    configure,
    unlockInput,
    startRace,
    backToStart,
    resetForRematch,
    onKeydown,
    destroy,
    finishRace,
  }
}
