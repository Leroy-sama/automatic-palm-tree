<script setup lang="ts">
import type { Lane } from '~/components/RaceTrack.vue'
import type { Difficulty } from '~/utils/quotes'

definePageMeta({ layout: 'default' })

const {
  difficulty,
  previewQuote,
  screen,
  running,
  hudTime,
  hudWpm,
  hudAcc,
  playerPct,
  cpuPct,
  result,
  promptChars,
  refreshPreview,
  setDifficulty,
  configure,
  startRace,
  backToStart,
  onKeydown,
  destroy,
} = useTypingEngine()

const scoreSaved = ref<boolean | null>(null)
const scoreError = ref('')
const isNewBest = ref<boolean | null>(null)
const bestWpm = ref<number | null>(null)
const { status, token } = useAuth()

const lanes = computed<Lane[]>(() => [
  {
    id: 'you',
    label: 'YOU',
    pct: playerPct.value,
    running: running.value,
    colorClass: 'p1',
  },
  {
    id: 'cpu',
    label: 'CPU',
    pct: cpuPct.value,
    running: running.value,
    colorClass: 'p2',
  },
])

onMounted(() => {
  refreshPreview()
  configure({
    cpu: true,
    onFinish: async (r) => {
      scoreError.value = ''
      isNewBest.value = null
      bestWpm.value = null
      if (status.value !== 'authenticated' || !token.value) {
        scoreSaved.value = false
        return
      }
      try {
        const res = await $fetch<{ isNewBest: boolean; bestWpm: number }>('/api/scores', {
          method: 'POST',
          headers: { Authorization: token.value },
          body: {
            mode: 'solo',
            wpm: r.wpm,
            accuracy: r.accuracy,
            timeMs: Math.round(r.elapsed * 1000),
            quoteText: r.quoteText,
          },
        })
        scoreSaved.value = true
        isNewBest.value = res.isNewBest
        bestWpm.value = res.bestWpm
      } catch (e: any) {
        scoreSaved.value = false
        scoreError.value =
          e?.data?.message || e?.data?.statusMessage || 'Could not save score'
      }
    },
  })
})

onBeforeUnmount(() => destroy())

function onStart() {
  scoreSaved.value = null
  scoreError.value = ''
  isNewBest.value = null
  bestWpm.value = null
  startRace()
}

function onDiff(d: Difficulty) {
  setDifficulty(d)
}
</script>

<template>
  <StartScreen
    v-if="screen === 'start'"
    :preview="previewQuote"
    :difficulty="difficulty"
    @update:difficulty="onDiff"
    @start="onStart"
  />
  <GameScreen
    v-else-if="screen === 'game'"
    :hud-time="hudTime"
    :hud-wpm="hudWpm"
    :hud-acc="hudAcc"
    :lanes="lanes"
    :chars="promptChars"
    @keydown="onKeydown"
  />
  <ResultScreen
    v-else-if="result"
    :result="result"
    :saved="scoreSaved"
    :logged-in="status === 'authenticated'"
    :save-error="scoreError"
    :is-new-best="isNewBest"
    :best-wpm="bestWpm"
    @again="backToStart()"
  />
</template>
