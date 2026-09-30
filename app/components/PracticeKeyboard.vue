<script setup lang="ts">
const props = defineProps<{
  unlocked: string
  focus: string
}>()

const rows = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
]

function kind(c: string) {
  if (props.focus.includes(c)) return 'focus'
  if (props.unlocked.includes(c)) return 'open'
  return 'locked'
}
</script>

<template>
  <div
    class="kb"
    aria-hidden="true"
  >
    <div
      v-for="(row, ri) in rows"
      :key="ri"
      class="kb-row"
      :style="{ paddingLeft: `${ri * 12}px` }"
    >
      <span
        v-for="c in row"
        :key="c"
        class="kb-key"
        :class="kind(c)"
      >{{ c.toUpperCase() }}</span>
    </div>
  </div>
</template>

<style scoped>
.kb {
  margin: 0 auto 16px;
  max-width: 420px;
}

.kb-row {
  display: flex;
  gap: 4px;
  justify-content: center;
  margin-bottom: 4px;
}

.kb-key {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  background: var(--ink);
  border: 2px solid var(--panel-edge);
  color: var(--cloud-light);
  opacity: 0.25;
}

.kb-key.open {
  opacity: 1;
  border-color: var(--good);
  color: var(--good);
}

.kb-key.focus {
  opacity: 1;
  border-color: var(--gold);
  color: var(--gold);
  background: #2a2208;
}
</style>
