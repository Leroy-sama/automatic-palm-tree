<script setup lang="ts">
import PartySocket from 'partysocket'
import type { Lane, LaneColor } from '~/components/RaceTrack.vue'
import type { Quote } from '~/utils/quotes'

definePageMeta({ layout: 'default' })

const LANE_COLORS: LaneColor[] = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']

type Player = {
  id: string
  name: string
  ready: boolean
  progress: number
  wpm: number
  accuracy: number
  finished: boolean
  disconnected: boolean
  wantRematch?: boolean
}

type RoomState = {
  status: 'lobby' | 'countdown' | 'racing' | 'finished'
  quote: Quote | null
  startAt: number | null
  players: Record<string, Player>
}

const route = useRoute()
const config = useRuntimeConfig()
const { data: authData, status: authStatus, token } = useAuth()

const roomId = computed(() => String(route.params.roomId))
const roomState = ref<RoomState>({
  status: 'lobby',
  quote: null,
  startAt: null,
  players: {},
})
const connected = ref(false)
const connectionError = ref('')
const countdownLabel = ref('')
const scoreSaved = ref<boolean | null>(null)
const isNewBest = ref<boolean | null>(null)
const copyOk = ref(false)

const playerId = useState('race-player-id', () => '')
const displayName = computed(() => {
  const u = (authData.value as { username?: string } | null)?.username
  if (authStatus.value === 'authenticated' && u) return u
  return `Guest-${playerId.value.slice(0, 4) || '????'}`
})

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
  unlockInput,
  startRace,
  onKeydown,
  destroy,
  inputLocked,
  resetForRematch,
} = useTypingEngine()

let socket: PartySocket | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null
let lobbyHeartbeat: ReturnType<typeof setInterval> | null = null
let raceStartedLocal = false

async function putLobby(status: 'open' | 'closed', state = roomState.value) {
  const active = Object.values(state.players).filter((p) => !p.disconnected)
  const host = active[0]?.name || displayName.value
  try {
    await $fetch(`/api/lobbies/${roomId.value}`, {
      method: 'PUT',
      body: {
        hostName: host,
        playerCount: active.length,
        status,
      },
    })
  } catch {
    /* listing is best-effort */
  }
}

function syncLobbyListing(state: RoomState) {
  if (lobbyHeartbeat) {
    clearInterval(lobbyHeartbeat)
    lobbyHeartbeat = null
  }
  if (state.status === 'lobby' && state.players[playerId.value]) {
    putLobby('open', state)
    lobbyHeartbeat = setInterval(() => putLobby('open'), 30_000)
  } else if (state.status !== 'lobby') {
    putLobby('closed', state)
  }
}

const me = computed(() => roomState.value.players[playerId.value])

const lanes = computed<Lane[]>(() =>
  Object.values(roomState.value.players)
    .filter((p) => !p.disconnected)
    .map((p, i) => ({
      id: p.id,
      label: p.name,
      pct: p.id === playerId.value ? playerPct.value : p.progress,
      running: roomState.value.status === 'racing' && !p.finished,
      colorClass: LANE_COLORS[i % LANE_COLORS.length],
    })),
)

const activePlayerCount = computed(
  () => Object.values(roomState.value.players).filter((p) => !p.disconnected).length,
)

const readyCount = computed(
  () =>
    Object.values(roomState.value.players).filter((p) => !p.disconnected && p.ready).length,
)

const rematchCount = computed(
  () =>
    Object.values(roomState.value.players).filter((p) => !p.disconnected && p.wantRematch)
      .length,
)

const allFinished = computed(() => roomState.value.status === 'finished')

const winnerLabel = computed(() => {
  const finished = Object.values(roomState.value.players)
    .filter((p) => p.finished)
    .sort((a, b) => b.wpm - a.wpm)
  if (!finished.length) return 'RACE OVER'
  if (finished[0]!.id === playerId.value) return 'YOU WIN!'
  return `${finished[0]!.name} WINS`
})

function ensurePlayerId() {
  if (import.meta.server) return
  let id = sessionStorage.getItem('typerace-player-id')
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem('typerace-player-id', id)
  }
  playerId.value = id
}

function send(msg: object) {
  socket?.send(JSON.stringify(msg))
}

function clearCountdown() {
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = null
  countdownLabel.value = ''
}

function beginLocalRace(quote: Quote, startAt: number) {
  raceStartedLocal = true
  configure({
    quote,
    cpu: false,
    locked: true,
    onProgress: (progress, wpm, accuracy) => {
      send({ type: 'progress', progress, wpm, accuracy })
    },
    onFinish: async (r) => {
      send({
        type: 'finish',
        wpm: r.wpm,
        accuracy: r.accuracy,
        timeMs: Math.round(r.elapsed * 1000),
      })
      if (authStatus.value !== 'authenticated' || !token.value) {
        scoreSaved.value = false
        isNewBest.value = null
        return
      }
      try {
        const res = await $fetch<{ isNewBest: boolean }>('/api/scores', {
          method: 'POST',
          headers: { Authorization: token.value },
          body: {
            mode: 'multiplayer',
            wpm: r.wpm,
            accuracy: r.accuracy,
            timeMs: Math.round(r.elapsed * 1000),
            quoteText: r.quoteText,
            roomId: roomId.value,
          },
        })
        scoreSaved.value = true
        isNewBest.value = res.isNewBest
      } catch {
        scoreSaved.value = false
        isNewBest.value = null
      }
    },
  })
  startRace()

  const tick = () => {
    const left = startAt - Date.now()
    if (left <= 0) {
      clearCountdown()
      unlockInput()
      return
    }
    countdownLabel.value = String(Math.ceil(left / 1000))
  }
  tick()
  countdownTimer = setInterval(tick, 100)
}

function onState(state: RoomState) {
  roomState.value = state

  if (
    (state.status === 'countdown' || state.status === 'racing') &&
    state.quote &&
    state.startAt &&
    !raceStartedLocal &&
    state.players[playerId.value]
  ) {
    beginLocalRace(state.quote, state.startAt)
  }

  if (state.status === 'lobby') {
    raceStartedLocal = false
    scoreSaved.value = null
    isNewBest.value = null
    clearCountdown()
    // Everyone returns to lobby together when the room resets (rematch).
    if (screen.value !== 'start') resetForRematch()
  }

  syncLobbyListing(state)
}

onMounted(() => {
  ensurePlayerId()
  const host = (config.public.partyHost as string)?.trim()
  if (!host || host === 'localhost:8787') {
    // localhost only works in local dev — on Vercel it means multiplayer isn't configured
    const isLocal =
      import.meta.client &&
      (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    if (!host) {
      connectionError.value =
        'Multiplayer is not configured. Set NUXT_PUBLIC_PARTY_HOST to your Cloudflare Worker URL (pnpm party:deploy).'
      return
    }
    if (!isLocal && host.includes('localhost')) {
      connectionError.value =
        'Rooms need a deployed PartyServer. Run pnpm party:deploy, then set NUXT_PUBLIC_PARTY_HOST on Vercel to your *.workers.dev host (not localhost).'
      return
    }
  }

  connectionError.value = ''
  socket = new PartySocket({
    host,
    party: 'race-server',
    room: roomId.value,
  })

  socket.addEventListener('open', () => {
    connected.value = true
    connectionError.value = ''
    send({ type: 'join', playerId: playerId.value, name: displayName.value })
  })
  socket.addEventListener('close', () => {
    connected.value = false
    if (!connectionError.value) {
      connectionError.value =
        'Lost connection to the race server. Check that the Party Worker is deployed and NUXT_PUBLIC_PARTY_HOST is correct.'
    }
  })
  socket.addEventListener('error', () => {
    connected.value = false
    connectionError.value =
      'Could not connect to the race server. Deploy with pnpm party:deploy and set NUXT_PUBLIC_PARTY_HOST on Vercel.'
  })
  socket.addEventListener('message', (ev) => {
    try {
      const data = JSON.parse(String(ev.data))
      if (data.type === 'error' && data.message) {
        connectionError.value = String(data.message)
        return
      }
      if (data.type === 'state') onState(data.state as RoomState)
    } catch {
      /* ignore */
    }
  })
})

onBeforeUnmount(() => {
  clearCountdown()
  if (lobbyHeartbeat) clearInterval(lobbyHeartbeat)
  putLobby('closed')
  destroy()
  socket?.close()
})

function toggleReady() {
  send({ type: 'ready' })
}

function rematch() {
  if (!allFinished.value || me.value?.wantRematch) return
  send({ type: 'rematch' })
}

async function copyLink() {
  await navigator.clipboard.writeText(window.location.href)
  copyOk.value = true
  setTimeout(() => {
    copyOk.value = false
  }, 1500)
}

const showLobby = computed(
  () =>
    roomState.value.status === 'lobby' ||
    (!raceStartedLocal && roomState.value.status !== 'racing'),
)
</script>

<template>
  <div class="panel-page" style="position: relative">
    <div
      v-if="countdownLabel"
      class="countdown-overlay"
    >
      {{ countdownLabel }}
    </div>

    <template v-if="showLobby && screen !== 'game' && screen !== 'result'">
      <h1>ROOM {{ roomId }}</h1>
      <p
        v-if="connectionError"
        class="form-error"
        style="max-width: 520px; margin: 0 auto 16px; line-height: 1.5"
      >
        {{ connectionError }}
      </p>
      <p
        v-else
        class="cta-note"
      >
        {{ connected ? 'Connected' : 'Connecting…' }}
        · You are <strong>{{ displayName }}</strong>
      </p>
      <p class="cta-note">
        Racers {{ activePlayerCount }}/8 · Ready {{ readyCount }}/{{ activePlayerCount || 0 }}
        · Need 2+ all ready to start
      </p>
      <div class="btn-row">
        <button
          type="button"
          class="action-btn pixel-font"
          @click="copyLink"
        >
          {{ copyOk ? 'COPIED!' : 'COPY LINK' }}
        </button>
        <button
          type="button"
          class="action-btn pixel-font"
          :class="{ secondary: me?.ready }"
          :disabled="!me || !connected || !!connectionError"
          @click="toggleReady"
        >
          {{ me?.ready ? 'UNREADY' : 'READY' }}
        </button>
      </div>
      <ul class="lobby-list">
        <li
          v-for="p in Object.values(roomState.players).filter((x) => !x.disconnected)"
          :key="p.id"
        >
          <span>{{ p.name }}{{ p.id === playerId ? ' (you)' : '' }}</span>
          <span :class="{ ready: p.ready }">{{ p.ready ? 'READY' : '…' }}</span>
        </li>
      </ul>
      <p class="cta-note">
        Friends: home → <strong>JOIN ROOM</strong> → paste this link or code
        <code class="room-code">{{ roomId }}</code>
      </p>
      <p class="cta-note">
        <NuxtLink to="/">← Back home</NuxtLink>
      </p>
    </template>

    <GameScreen
      v-else-if="screen === 'game'"
      :hud-time="hudTime"
      :hud-wpm="hudWpm"
      :hud-acc="hudAcc"
      :lanes="lanes"
      :chars="promptChars"
      :hint="inputLocked ? 'get ready…' : 'type!' "
      @keydown="onKeydown"
    />

    <div
      v-else-if="screen === 'result' && result"
      class="result-screen"
    >
      <div
        class="result-banner pixel-font"
        :class="result.playerWon || winnerLabel === 'YOU WIN!' ? 'win' : 'lose'"
      >
        {{ winnerLabel }}
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
        v-if="scoreSaved === false && authStatus !== 'authenticated'"
        class="cta-note"
      >
        <NuxtLink to="/register">Sign up</NuxtLink> to save this score.
      </p>
      <p
        v-else-if="scoreSaved === true && isNewBest"
        class="cta-note"
      >
        New high score!
      </p>
      <p
        v-else-if="scoreSaved === true && isNewBest === false"
        class="cta-note"
      >
        Not a new high score
      </p>
      <div class="btn-row">
        <button
          v-if="allFinished"
          type="button"
          class="again-btn pixel-font"
          :disabled="!!me?.wantRematch"
          @click="rematch"
        >
          {{ me?.wantRematch ? 'WAITING…' : 'REMATCH' }}
        </button>
        <NuxtLink
          to="/"
          class="action-btn secondary pixel-font"
          style="text-decoration: none"
        >
          HOME
        </NuxtLink>
      </div>
      <p
        v-if="!allFinished"
        class="cta-note"
      >
        Waiting for everyone to finish…
      </p>
      <p
        v-else
        class="cta-note"
      >
        Rematch {{ rematchCount }}/{{ activePlayerCount }} · all must vote to return to lobby
      </p>
    </div>
  </div>
</template>
