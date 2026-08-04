<script setup lang="ts">
export type Lane = {
  id: string
  label: string
  pct: number
  running: boolean
  colorClass?: 'p1' | 'p2'
}

defineProps<{
  lanes: Lane[]
}>()
</script>

<template>
  <div class="race">
    <div
      v-for="(lane, idx) in lanes"
      :key="lane.id"
      class="lane"
    >
      <span class="lane-label">{{ lane.label }}</span>
      <div
        class="runner"
        :class="[lane.colorClass ?? (idx === 0 ? 'p1' : 'p2'), { running: lane.running }]"
        :style="{ left: `${4 + lane.pct * 100 * 0.92}%` }"
      >
        <div class="head" />
        <div class="body" />
        <div class="leg l" />
        <div class="leg r" />
      </div>
    </div>
    <div class="finish" />
  </div>
</template>
