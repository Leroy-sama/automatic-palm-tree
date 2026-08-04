<script setup lang="ts">
import type { Difficulty } from '~/utils/quotes'
import type { Quote } from '~/utils/quotes'

const props = defineProps<{
  preview: Quote
  difficulty: Difficulty
}>()

const emit = defineEmits<{
  start: []
  'update:difficulty': [Difficulty]
}>()

const diffs: Difficulty[] = ['easy', 'medium', 'hard']
</script>

<template>
  <div class="start-screen">
    <div class="sun" />
    <div class="cloud" style="top: 50px; left: 40px">
      <div style="width: 60px; height: 14px; left: 0; top: 6px" />
      <div style="width: 34px; height: 14px; left: 14px; top: 0" />
      <div class="hi" style="width: 26px; height: 6px; left: 6px; top: 2px" />
    </div>
    <div class="cloud" style="top: 90px; left: 220px">
      <div style="width: 44px; height: 12px; left: 0; top: 4px" />
      <div style="width: 26px; height: 12px; left: 10px; top: 0" />
    </div>

    <div class="title-wrap">
      <div class="title pixel-font">TYPE<span class="accent">RACE</span></div>
      <div class="subtitle pixel-font">A KEYSTROKE SPEEDWAY</div>
    </div>

    <div class="quote-panel">
      {{ props.preview.text }}
      <span class="src">— {{ props.preview.src }}</span>
    </div>

    <div class="difficulty-row">
      <button
        v-for="d in diffs"
        :key="d"
        type="button"
        class="diff-btn"
        :class="{ selected: difficulty === d }"
        @click="emit('update:difficulty', d)"
      >
        {{ d.toUpperCase() }}
      </button>
    </div>

    <button
      type="button"
      class="start-btn pixel-font"
      @click="emit('start')"
    >
      PRESS TO START
    </button>

    <div class="ground">
      <div class="grass-strip" />
      <div class="track" />
    </div>
  </div>
</template>
