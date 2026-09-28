<script setup lang="ts">
import { parseRoomId } from '~/utils/roomId'

definePageMeta({ layout: 'default' })

const creating = ref(false)
const joining = ref(false)
const error = ref('')
const joinInput = ref('')
const showJoin = ref(false)

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

async function joinRoom() {
  error.value = ''
  const roomId = parseRoomId(joinInput.value)
  if (!roomId) {
    error.value = 'Enter a room code or paste a race link'
    return
  }
  joining.value = true
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
        @click="showJoin = !showJoin"
      >
        JOIN ROOM
      </button>

      <form
        v-if="showJoin"
        class="join-box"
        @submit.prevent="joinRoom"
      >
        <input
          v-model="joinInput"
          class="join-input"
          type="text"
          autocomplete="off"
          spellcheck="false"
          placeholder="Room code or paste link"
          aria-label="Room code or race link"
        >
        <button
          type="submit"
          class="action-btn pixel-font"
          :disabled="joining || !joinInput.trim()"
        >
          {{ joining ? '…' : 'GO' }}
        </button>
      </form>

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
        Multiplayer: 2–8 racers · share a link or enter a code
      </p>
    </div>

    <div class="ground">
      <div class="grass-strip" />
      <div class="track" />
    </div>
  </div>
</template>
