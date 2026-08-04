<script setup lang="ts">
import type { RaceResult } from '~/composables/useTypingEngine'

defineProps<{
  result: RaceResult
  loseLabel?: string
  saved?: boolean | null
  loggedIn?: boolean
  saveError?: string
  isNewBest?: boolean | null
  bestWpm?: number | null
}>()

const emit = defineEmits<{
  again: []
}>()
</script>

<template>
  <div class="result-screen">
    <div
      class="result-banner pixel-font"
      :class="result.playerWon ? 'win' : 'lose'"
    >
      {{ result.playerWon ? 'YOU WIN!' : (loseLabel ?? 'CPU WINS') }}
    </div>
    <div class="stat-grid">
      <div class="stat-box">
        <div class="num">{{ result.wpm }}</div>
        <div class="lbl">WPM</div>
      </div>
      <div class="stat-box">
        <div class="num">{{ result.accuracy }}%</div>
        <div class="lbl">Accuracy</div>
      </div>
      <div class="stat-box">
        <div class="num">{{ result.elapsed.toFixed(1) }}s</div>
        <div class="lbl">Time</div>
      </div>
    </div>
    <p
      v-if="saved === true && isNewBest"
      class="cta-note"
    >
      New high score!
    </p>
    <p
      v-else-if="saved === true && isNewBest === false"
      class="cta-note"
    >
      High score stays at {{ bestWpm }} WPM
    </p>
    <p
      v-else-if="saved === false && loggedIn"
      class="form-error"
    >
      {{ saveError || 'Could not save score' }}
    </p>
    <p
      v-else-if="saved === false"
      class="cta-note"
    >
      <NuxtLink to="/register">Sign up</NuxtLink> to save this score.
    </p>
    <button
      type="button"
      class="again-btn pixel-font"
      @click="emit('again')"
    >
      RACE AGAIN
    </button>
  </div>
</template>
