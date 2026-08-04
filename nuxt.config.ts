// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@sidebase/nuxt-auth'],
  css: ['~/assets/css/retro.css'],
  nitro: {
    preset: 'vercel',
  },

  /**
   * Nuxt env contract (prefer this over process.env in app/server code):
   * - Private keys → server-only via useRuntimeConfig()
   * - public.* → available on client too (never put secrets here)
   * - Override at runtime with matching NUXT_ / NUXT_PUBLIC_ env vars
   *
   *   authSecret          ← NUXT_AUTH_SECRET
   *   tursoDatabaseUrl    ← NUXT_TURSO_DATABASE_URL
   *   tursoAuthToken      ← NUXT_TURSO_AUTH_TOKEN
   *   public.partyHost    ← NUXT_PUBLIC_PARTY_HOST
   */
  runtimeConfig: {
    // server-only
    authSecret: '',
    tursoDatabaseUrl: '',
    tursoAuthToken: '',
    public: {
      // client + server
      partyHost: '',
    },
  },

  auth: {
    baseURL: '/api/auth',
    provider: {
      type: 'local',
      endpoints: {
        signIn: { path: '/login', method: 'post' },
        signOut: { path: '/logout', method: 'post' },
        signUp: { path: '/register', method: 'post' },
        getSession: { path: '/session', method: 'get' },
      },
      token: {
        signInResponseTokenPointer: '/token',
        type: 'Bearer',
        cookieName: 'auth.token',
        headerName: 'Authorization',
        maxAgeInSeconds: 60 * 60 * 24 * 7,
      },
      session: {
        dataType: { id: 'string', username: 'string' },
        dataResponsePointer: '/',
      },
      pages: {
        login: '/login',
      },
    },
    globalAppMiddleware: {
      isEnabled: false,
    },
  },
})
