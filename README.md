# TypeRace

Pixel typing race — solo vs CPU or share a link and race friends.

## Stack

- Nuxt 4 (Vercel / Nitro)
- Turso + Drizzle
- `@sidebase/nuxt-auth` (local username/password)
- PartyServer + Wrangler (Cloudflare Durable Objects)

## Dev

```bash
pnpm install
pnpm db:migrate
pnpm party:dev   # terminal 1 — multiplayer worker
pnpm dev         # terminal 2 — http://localhost:3000
```

See [DEPLOY.md](./DEPLOY.md) for production.

Prototype reference: [`index.html`](./index.html).
