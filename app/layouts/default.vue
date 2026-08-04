<script setup lang="ts">
const { status, data, signOut } = useAuth()

async function logout() {
  await signOut({ redirect: false })
  await navigateTo('/')
}
</script>

<template>
  <div class="app-shell">
    <nav class="app-nav">
      <div class="nav-links">
        <NuxtLink to="/">HOME</NuxtLink>
        <NuxtLink to="/solo">SOLO</NuxtLink>
        <NuxtLink to="/leaderboard">BOARD</NuxtLink>
      </div>
      <div class="nav-user">
        <template v-if="status === 'authenticated' && data">
          {{ (data as { username?: string }).username }}
          ·
          <a
            href="#"
            @click.prevent="logout"
          >OUT</a>
        </template>
        <template v-else>
          <NuxtLink to="/login">LOGIN</NuxtLink>
          ·
          <NuxtLink to="/register">JOIN</NuxtLink>
        </template>
      </div>
    </nav>
    <div class="stage">
      <slot />
    </div>
  </div>
</template>
