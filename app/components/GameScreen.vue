<script setup lang="ts">
import type { Lane } from '~/components/RaceTrack.vue'
import type { PromptChar } from '~/composables/useTypingEngine'

const props = defineProps<{
  hudTime: number
  hudWpm: number
  hudAcc: number
  lanes: Lane[]
  chars: PromptChar[]
  hint?: string
}>()

const emit = defineEmits<{
  keydown: [KeyboardEvent]
  focus: []
}>()

const inputEl = ref<HTMLInputElement | null>(null)

function focusInput() {
  inputEl.value?.focus()
  emit('focus')
}

onMounted(() => focusInput())

defineExpose({ focusInput })
</script>

<template>
  <div
    class="game-screen"
    @click="focusInput"
  >
    <div class="hud">
      <div>TIME <span class="val">{{ hudTime.toFixed(1) }}s</span></div>
      <div>WPM <span class="val">{{ hudWpm }}</span></div>
      <div>ACC <span class="val">{{ hudAcc }}%</span></div>
    </div>

    <RaceTrack :lanes="lanes" />
    <TypingPrompt :chars="chars" />
    <div class="hint">
      {{ hint ?? 'start typing to begin · mistakes step you back one letter' }}
    </div>
    <input
      ref="inputEl"
      class="hidden-input"
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
      @keydown="emit('keydown', $event)"
    >
  </div>
</template>
