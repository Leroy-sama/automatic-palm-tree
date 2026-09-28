<script setup lang="ts">
export type LaneColor = 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7' | 'p8'

export type Lane = {
  id: string
  label: string
  pct: number
  running: boolean
  colorClass?: LaneColor
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
        :class="[lane.colorClass ?? `p${(idx % 8) + 1}`, { running: lane.running }]"
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
