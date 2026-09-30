<script setup lang="ts">
import type { Lane } from '~/components/RaceTrack.vue'
import {
  MAX_ERR,
  NEW_STATE,
  START_KEYS,
  UNLOCK_ORDER,
  focusKey,
  keyAcc,
  keyDone,
  maybeUnlock,
  practiceText,
  recordKey,
  unlockedKeys,
  type PracticeState,
} from '~/utils/practice'

definePageMeta({ layout: 'default' })

const STORE = 'typerace-practice'
const { status, token } = useAuth()
const state = ref<PracticeState>(NEW_STATE())
const newKey = ref<string | null>(null)
const selected = ref<string[]>([])
const loading = ref(true)
const saveError = ref('')

const {
  screen,
  running,
  hudTime,
  hudWpm,
  hudAcc,
  playerPct,
  result,
  promptChars,
  configure,
  startRace,
  onKeydown,
  destroy,
} = useTypingEngine()

const lanes = computed<Lane[]>(() => [
  { id: 'you', label: 'YOU', pct: playerPct.value, running: running.value, colorClass: 'p1' },
])

const autoFocus = computed(() => focusKey(state.value))
const openKeys = computed(() => unlockedKeys(state.value))
const keys = computed(() => {
  const open = openKeys.value
  return [...START_KEYS + UNLOCK_ORDER].map(c => ({
    c,
    locked: !open.includes(c),
    done: keyDone(state.value.stats[c]),
    acc: keyAcc(state.value.stats[c]),
    picked: selected.value.includes(c),
  }))
})

const focusHint = computed(() => {
  if (!selected.value.length) return `auto: ${autoFocus.value.toUpperCase()}`
  return selected.value.map(c => c.toUpperCase()).join(' ')
})

let lastHit: number | null = null
function onKey(expected: string, ok: boolean) {
  const now = performance.now()
  if (/[a-z]/.test(expected)) {
    recordKey(state.value, expected, ok, lastHit === null ? null : now - lastHit)
  }
  if (ok) lastHit = now
}

function toggleKey(c: string) {
  if (!openKeys.value.includes(c)) return
  selected.value = selected.value.includes(c)
    ? selected.value.filter(x => x !== c)
    : [...selected.value, c]
}

function pickRandom() {
  const open = [...openKeys.value]
  if (!open.length) return
  const n = Math.max(1, Math.ceil(open.length / 2))
  const shuffled = open.sort(() => Math.random() - 0.5)
  selected.value = shuffled.slice(0, n)
}

function clearSelection() {
  selected.value = []
}

async function persist() {
  if (status.value !== 'authenticated' || !token.value) return
  localStorage.setItem(STORE, JSON.stringify(state.value))
  try {
    await $fetch('/api/practice', {
      method: 'PUT',
      headers: { Authorization: token.value },
      body: { level: state.value.level, stats: state.value.stats },
    })
    saveError.value = ''
  } catch (e: any) {
    saveError.value = e?.data?.statusMessage || 'Could not save progress'
  }
}

function start() {
  newKey.value = null
  lastHit = null
  selected.value = selected.value.filter(c => openKeys.value.includes(c))
  configure({
    quote: {
      text: practiceText(state.value, 15, Math.random, selected.value.join('')),
      src: 'PRACTICE',
    },
    cpu: false,
    onKey,
    onFinish: async () => {
      newKey.value = maybeUnlock(state.value)
      await persist()
    },
  })
  startRace()
}

async function reset() {
  if (!confirm('Reset all practice progress?')) return
  state.value = NEW_STATE()
  selected.value = []
  localStorage.removeItem(STORE)
  if (status.value === 'authenticated' && token.value) {
    try {
      await $fetch('/api/practice', {
        method: 'DELETE',
        headers: { Authorization: token.value },
      })
    } catch {
      /* ignore */
    }
  }
}

async function loadProgress() {
  loading.value = true
  saveError.value = ''
  if (status.value !== 'authenticated' || !token.value) {
    loading.value = false
    return
  }
  try {
    const remote = await $fetch<{ level: number; stats: PracticeState['stats'] }>('/api/practice', {
      headers: { Authorization: token.value },
    })
    const hasRemote = remote.level > 0 || Object.keys(remote.stats || {}).length > 0
    if (hasRemote) {
      state.value = { level: remote.level, stats: remote.stats || {} }
    } else {
      // Migrate one-time localStorage save up to the account.
      try {
        const saved = JSON.parse(localStorage.getItem(STORE) ?? 'null')
        if (saved && typeof saved.level === 'number' && saved.stats) {
          state.value = saved
          await persist()
          localStorage.removeItem(STORE)
        }
      } catch {
        /* corrupt local: start fresh */
      }
    }
  } catch (e: any) {
    saveError.value = e?.data?.statusMessage || 'Could not load progress'
  } finally {
    loading.value = false
  }
}

watch(status, (s) => {
  if (s === 'authenticated') loadProgress()
})

onMounted(() => loadProgress())
onBeforeUnmount(() => destroy())
</script>

<template>
  <div
    v-if="status !== 'authenticated'"
    class="result-screen"
  >
    <div class="result-banner win pixel-font">
      PRACTICE
    </div>
    <p class="cta-note">
      Sign in to save your letter progress across devices.
    </p>
    <div class="btn-row">
      <NuxtLink
        to="/login"
        class="again-btn pixel-font"
        style="text-decoration: none"
      >
        LOGIN
      </NuxtLink>
      <NuxtLink
        to="/register"
        class="action-btn secondary pixel-font"
        style="text-decoration: none"
      >
        JOIN
      </NuxtLink>
    </div>
  </div>

  <div
    v-else-if="loading"
    class="result-screen"
  >
    <p class="cta-note">
      Loading progress…
    </p>
  </div>

  <GameScreen
    v-else-if="screen === 'game'"
    :hud-time="hudTime"
    :hud-wpm="hudWpm"
    :hud-acc="hudAcc"
    :lanes="lanes"
    :chars="promptChars"
    :hint="`focus: ${focusHint} · wrong keys stay on the same letter`"
    @keydown="onKeydown"
  />

  <div
    v-else
    class="result-screen"
  >
    <div class="result-banner win pixel-font">
      PRACTICE
    </div>
    <p
      v-if="newKey"
      class="cta-note"
    >
      New letter unlocked: {{ newKey.toUpperCase() }}
    </p>
    <p
      v-if="saveError"
      class="form-error"
    >
      {{ saveError }}
    </p>
    <div
      v-if="result"
      class="stat-grid"
    >
      <div class="stat-box">
        <div class="num">
          {{ result.wpm }}
        </div>
        <div class="lbl">
          WPM
        </div>
      </div>
      <div class="stat-box">
        <div class="num">
          {{ result.accuracy }}%
        </div>
        <div class="lbl">
          Accuracy
        </div>
      </div>
      <div class="stat-box">
        <div class="num">
          {{ result.elapsed.toFixed(1) }}s
        </div>
        <div class="lbl">
          Time
        </div>
      </div>
    </div>

    <PracticeKeyboard
      :unlocked="openKeys"
      :focus="selected.length ? selected.join('') : autoFocus"
    />

    <div class="key-grid">
      <button
        v-for="k in keys"
        :key="k.c"
        type="button"
        class="key"
        :class="{ locked: k.locked, done: k.done, picked: k.picked, focus: !selected.length && k.c === autoFocus }"
        :disabled="k.locked"
        :title="k.locked ? 'locked' : `${k.acc}% — click to select`"
        @click="toggleKey(k.c)"
      >
        <span class="pixel-font">{{ k.c.toUpperCase() }}</span>
        <small>{{ k.locked ? '' : `${k.acc}%` }}</small>
      </button>
    </div>
    <p class="cta-note">
      Click unlocked letters to practice them · empty = auto (weakest) · unlock at
      {{ Math.round((1 - MAX_ERR) * 100) }}%+ accuracy
    </p>

    <div class="btn-row">
      <button
        type="button"
        class="again-btn pixel-font"
        @click="start"
      >
        START
      </button>
      <button
        type="button"
        class="action-btn secondary pixel-font"
        @click="pickRandom"
      >
        RANDOM
      </button>
      <button
        type="button"
        class="action-btn secondary pixel-font"
        :disabled="!selected.length"
        @click="clearSelection"
      >
        CLEAR
      </button>
      <button
        type="button"
        class="action-btn secondary pixel-font"
        @click="reset"
      >
        RESET
      </button>
    </div>
  </div>
</template>

<style scoped>
.key-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-bottom: 14px;
}

.key {
  width: 42px;
  padding: 6px 0;
  background: var(--ink);
  border: 2px solid var(--panel-edge);
  color: var(--cloud-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font: inherit;
}

.key:disabled {
  cursor: not-allowed;
}

.key span {
  font-size: 12px;
}

.key small {
  font-size: 14px;
  min-height: 14px;
}

.key.locked {
  opacity: 0.3;
}

.key.done {
  border-color: var(--good);
  color: var(--good);
}

.key.focus {
  border-color: var(--gold);
  color: var(--gold);
}

.key.picked {
  border-color: var(--p1);
  color: var(--p1);
  background: #0a2038;
}
</style>
