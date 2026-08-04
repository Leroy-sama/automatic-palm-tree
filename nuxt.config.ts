// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@sidebase/nuxt-auth'],
  css: ['~/assets/css/retro.css'],
  nitro: {
    preset: 'vercel',
  },
  runtimeConfig: {
    tursoDatabaseUrl: '',
    tursoAuthToken: '',
    authSecret: '',
    public: {
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
