<script setup lang="ts">
defineProps<{
  chars: { ch: string; kind: 'correct' | 'incorrect' | 'current' | 'pending' }[]
}>()
</script>

<template>
  <div class="prompt-panel">
    <span
      v-for="(c, i) in chars"
      :key="i"
      :class="c.kind"
    >{{ c.ch }}</span>
  </div>
</template>
