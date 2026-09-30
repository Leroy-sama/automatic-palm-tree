<script setup lang="ts">
definePageMeta({ layout: 'default' })

type LobbyRow = {
  roomId: string
  hostName: string
  playerCount: number
  updatedAt: number
}

const creating = ref(false)
const joining = ref(false)
const error = ref('')
const showJoin = ref(false)
const lobbies = ref<LobbyRow[]>([])
const loadingLobbies = ref(false)

async function createRoom() {
  creating.value = true
  error.value = ''
  try {
    const { roomId } = await $fetch<{ roomId: string }>('/api/rooms', { method: 'POST' })
    await navigateTo(`/race/${roomId}`)
  } catch (e: any) {
    error.value = e?.data?.message || 'Could not create room'
  } finally {
    creating.value = false
  }
}

async function refreshLobbies() {
  loadingLobbies.value = true
  error.value = ''
  try {
    lobbies.value = await $fetch<LobbyRow[]>('/api/lobbies')
  } catch (e: any) {
    error.value = e?.data?.message || 'Could not load lobbies'
  } finally {
    loadingLobbies.value = false
  }
}

async function openJoin() {
  showJoin.value = !showJoin.value
  if (showJoin.value) await refreshLobbies()
}

async function joinLobby(roomId: string) {
  joining.value = true
  error.value = ''
  try {
    await navigateTo(`/race/${roomId}`)
  } finally {
    joining.value = false
  }
}
</script>

<template>
  <div class="start-screen">
    <div class="sun" />
    <div class="cloud" style="top: 50px; left: 40px">
      <div style="width: 60px; height: 14px; left: 0; top: 6px" />
      <div style="width: 34px; height: 14px; left: 14px; top: 0" />
    </div>

    <div class="title-wrap">
      <div class="title pixel-font">TYPE<span class="accent">RACE</span></div>
      <div class="subtitle pixel-font">A KEYSTROKE SPEEDWAY</div>
    </div>

    <div class="home-actions">
      <NuxtLink
        to="/solo"
        class="start-btn pixel-font"
        style="text-decoration: none; display: inline-block"
      >
        PLAY SOLO
      </NuxtLink>
      <NuxtLink
        to="/practice"
        class="action-btn pixel-font"
        style="text-decoration: none; display: inline-block"
      >
        PRACTICE
      </NuxtLink>
      <button
        type="button"
        class="action-btn pixel-font"
        :disabled="creating"
        @click="createRoom"
      >
        {{ creating ? 'CREATING…' : 'CREATE ROOM' }}
      </button>
      <button
        type="button"
        class="action-btn pixel-font"
        :class="{ secondary: showJoin }"
        @click="openJoin"
      >
        JOIN ROOM
      </button>

      <div
        v-if="showJoin"
        class="lobby-browser"
      >
        <div class="btn-row" style="margin-top: 0; margin-bottom: 10px">
          <button
            type="button"
            class="action-btn secondary pixel-font"
            :disabled="loadingLobbies"
            @click="refreshLobbies"
          >
            {{ loadingLobbies ? '…' : 'REFRESH' }}
          </button>
        </div>
        <ul
          v-if="lobbies.length"
          class="lobby-list"
        >
          <li
            v-for="lobby in lobbies"
            :key="lobby.roomId"
          >
            <span>{{ lobby.hostName }} · {{ lobby.playerCount }}/8</span>
            <button
              type="button"
              class="diff-btn"
              :disabled="joining"
              @click="joinLobby(lobby.roomId)"
            >
              JOIN
            </button>
          </li>
        </ul>
        <p
          v-else
          class="cta-note"
        >
          {{ loadingLobbies ? 'Loading…' : 'No open lobbies — create one' }}
        </p>
      </div>

      <NuxtLink
        to="/leaderboard"
        class="action-btn secondary pixel-font"
        style="text-decoration: none; display: inline-block"
      >
        LEADERBOARD
      </NuxtLink>
      <p
        v-if="error"
        class="form-error"
      >
        {{ error }}
      </p>
      <p class="cta-note">
        Multiplayer: create a room or join an open lobby
      </p>
    </div>

    <div class="ground">
      <div class="grass-strip" />
      <div class="track" />
    </div>
  </div>
</template>

<style scoped>
.lobby-browser {
  width: min(420px, 100%);
  margin: 0 auto;
}
</style>
