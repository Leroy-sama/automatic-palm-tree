<script setup lang="ts">
definePageMeta({ layout: 'default', auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: '/' } })

const { signIn } = useAuth()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await signIn(
      { username: username.value, password: password.value },
      { redirect: false, callbackUrl: '/' },
    )
    await navigateTo('/')
  } catch (e: any) {
    error.value =
      e?.data?.message ||
      e?.data?.statusMessage ||
      e?.statusMessage ||
      e?.message ||
      'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="panel-page">
    <h1>LOGIN</h1>
    <form
      class="form-stack"
      @submit.prevent="onSubmit"
    >
      <label>
        Username
        <input
          v-model="username"
          autocomplete="username"
          required
        >
      </label>
      <label>
        Password
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
        >
      </label>
      <p
        v-if="error"
        class="form-error"
      >
        {{ error }}
      </p>
      <button
        type="submit"
        class="action-btn pixel-font"
        :disabled="loading"
      >
        {{ loading ? '…' : 'ENTER' }}
      </button>
      <p class="cta-note">
        No account? <NuxtLink to="/register">Register</NuxtLink>
      </p>
    </form>
  </div>
</template>
