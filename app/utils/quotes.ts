export type Quote = { text: string; src: string }

export type TextHardness = {
  caps: boolean
  punctuation: boolean
}

export const DEFAULT_TEXT_HARDNESS: TextHardness = {
  caps: true,
  punctuation: true,
}

export const QUOTES: Quote[] = [
  {
    text: 'He picked up his guitar and played a simple melody that echoed through the quiet empty room.',
    src: 'J. BLOCK',
  },
  {
    text: 'The old lighthouse keeper watched the storm roll in, knowing this would be his last long night at sea.',
    src: 'M. HALE',
  },
  {
    text: 'Somewhere between the first draft and the last edit, the story finally found its own true voice.',
    src: 'R. OYELARAN',
  },
  {
    text: 'A quick fox cannot win every race, but it always learns something new about the track.',
    src: 'UNKNOWN',
  },
  {
    text: 'Practice does not make perfect, but it does make the fingers faster and the mind much calmer.',
    src: 'T. NAKASHIMA',
  },
  {
    text: 'The rocket cleared the tower in silence before the sound of the engines finally arrived.',
    src: 'C. OKONKWO',
  },
  {
    text: "Wait — don't stop now! Keep going; you'll get faster.",
    src: 'DRILL',
  },
  {
    text: 'Type carefully: commas, quotes, and periods all count.',
    src: 'DRILL',
  },
  {
    text: 'Rain tapped the window while the kettle whistled and the city woke up one light at a time.',
    src: 'A. REED',
  },
  {
    text: 'She packed a small bag, left a note on the table, and walked toward the station without looking back.',
    src: 'L. ORTEGA',
  },
  {
    text: 'In the market, vendors shouted prices and spices filled the air with heat and sweetness.',
    src: 'K. DIALLO',
  },
  {
    text: 'The map was wrong, the path was steep, and still they climbed until the valley opened below.',
    src: 'S. PARK',
  },
  {
    text: 'Every great idea starts messy: sketches, wrong turns, then one clear line that holds.',
    src: 'N. ADEYEMI',
  },
  {
    text: "Coffee cooled beside the keyboard. Focus returned. One more paragraph, then rest.",
    src: 'M. CHO',
  },
  {
    text: 'Under the bridge, the river moved slow and dark, carrying leaves toward an unknown sea.',
    src: 'P. VARGAS',
  },
  {
    text: 'If you can type this sentence without peeking, your fingers are already learning the road.',
    src: 'COACH',
  },
  {
    text: 'Thunder rolled across the plains as horses raced for the fence and dust rose in gold clouds.',
    src: 'J. WHITAKER',
  },
  {
    text: "Don't fear the hard keys — question marks? Exclamation points! They're just another step.",
    src: 'DRILL',
  },
  {
    text: 'Night buses hummed past empty shops while a radio played an old song nobody could name.',
    src: 'E. SANTOS',
  },
  {
    text: 'Build slowly, check twice, and trust the rhythm that forms when you stop forcing speed.',
    src: 'COACH',
  },
]

/** Apply caps / punctuation toggles to quote text. */
export function applyTextHardness(text: string, hardness: TextHardness): string {
  let out = text
  if (!hardness.punctuation) {
    // keep letters, digits, spaces, apostrophes in contractions optional — strip punctuation
    out = out.replace(/[^\p{L}\p{N}\s]/gu, '')
    out = out.replace(/\s+/g, ' ').trim()
  }
  if (!hardness.caps) {
    out = out.toLowerCase()
  }
  return out
}

export function pickQuote(seed?: number, hardness: TextHardness = DEFAULT_TEXT_HARDNESS): Quote {
  const i =
    seed === undefined
      ? Math.floor(Math.random() * QUOTES.length)
      : Math.abs(seed) % QUOTES.length
  const raw = QUOTES[i]!
  return { text: applyTextHardness(raw.text, hardness), src: raw.src }
}

export const DIFF = {
  easy: { wpm: 28, label: 'EASY' },
  medium: { wpm: 52, label: 'MEDIUM' },
  hard: { wpm: 78, label: 'HARD' },
} as const

export type Difficulty = keyof typeof DIFF

/** Correct contiguous prefix length — mistakes do not advance the runner. */
export function correctPrefixLength(text: string, typed: string): number {
  let n = 0
  const limit = Math.min(text.length, typed.length)
  while (n < limit && typed[n] === text[n]) n++
  return n
}

/** Standard WPM: (correct chars / 5) / minutes elapsed. Idle time lowers WPM. */
export function calcWpm(correctChars: number, elapsedSec: number): number {
  if (elapsedSec <= 0) return 0
  const minutes = elapsedSec / 60
  return Math.max(0, Math.round(correctChars / 5 / minutes))
}
