<script setup lang="ts">
definePageMeta({ layout: 'default', auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: '/' } })

const { signUp, signIn } = useAuth()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    // sidebase local signUp hits /register then we sign in
    await signUp(
      { username: username.value, password: password.value },
      { redirect: false },
    )
    await signIn(
      { username: username.value, password: password.value },
      { redirect: false },
    )
    await navigateTo('/')
  } catch (e: any) {
    error.value =
      e?.data?.message ||
      e?.data?.statusMessage ||
      e?.statusMessage ||
      e?.message ||
      'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="panel-page">
    <h1>REGISTER</h1>
    <form
      class="form-stack"
      @submit.prevent="onSubmit"
    >
      <label>
        Username
        <input
          v-model="username"
          autocomplete="username"
          minlength="3"
          maxlength="20"
          pattern="[A-Za-z0-9_]+"
          required
        >
      </label>
      <label>
        Password
        <input
          v-model="password"
          type="password"
          autocomplete="new-password"
          minlength="8"
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
        {{ loading ? '…' : 'CREATE' }}
      </button>
      <p class="cta-note">
        Have an account? <NuxtLink to="/login">Login</NuxtLink>
      </p>
    </form>
  </div>
</template>
