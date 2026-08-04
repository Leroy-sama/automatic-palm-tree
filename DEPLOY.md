# Deployment

## Vercel (Nuxt app)

1. Import the repo in Vercel (framework: Nuxt).
2. Set environment variables (see `.env.example`):
   - `NUXT_AUTH_SECRET` — 32+ random characters
   - `NUXT_TURSO_DATABASE_URL` — Turso `libsql://…` URL
   - `NUXT_TURSO_AUTH_TOKEN` — Turso auth token
   - `NUXT_PUBLIC_PARTY_HOST` — PartyServer host (e.g. `typerace-party.<account>.workers.dev`)
3. Deploy. Nitro uses `preset: 'vercel'`.

## Turso

```bash
turso db create typerace
turso db show typerace --url
turso db tokens create typerace
NUXT_TURSO_DATABASE_URL=… NUXT_TURSO_AUTH_TOKEN=… pnpm db:migrate
```

## Cloudflare PartyServer

```bash
pnpm party:deploy
# copy the *.workers.dev hostname into NUXT_PUBLIC_PARTY_HOST on Vercel
```

Local multiplayer:

```bash
pnpm party:dev   # usually http://localhost:8787
# .env already has NUXT_PUBLIC_PARTY_HOST=localhost:8787
pnpm dev
```
