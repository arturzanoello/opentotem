# OpenTotem

Open-source self-service kiosk platform: a React Native kiosk app, a Node.js API and a real-time web panel for the kitchen and the order display, plus `pos-bridge`, one TypeScript API for payment terminals from different manufacturers.

> Work in progress: day 1 of a 21-day build. [Versão em português](README.pt-BR.md).

## What's inside

| Path                  | What it is                                                    |
| --------------------- | ------------------------------------------------------------- |
| `apps/api`            | Node.js + Express + Drizzle (PostgreSQL)                      |
| `apps/kiosk`          | Expo (React Native) kiosk app, Expo Router                    |
| `apps/web`            | React + Vite: admin, kitchen display (KDS) and order display  |
| `packages/shared`     | Contracts and business rules shared by every app              |
| `packages/pos-bridge` | Payment terminal abstraction (adapter pattern, Kotlin module) |
| `packages/config`     | Shared TypeScript config                                      |
| `docs/adr`            | Architecture decision records                                 |

## Getting started

Requirements: Node.js 22+ (24 recommended), pnpm, and Docker (for PostgreSQL).

```bash
pnpm install
cp .env.example .env
pnpm db:up          # PostgreSQL on localhost:5432
pnpm dev            # API on :3333 and web panel on :5173
pnpm dev:kiosk      # Expo dev server for the kiosk app
```

Check the API: `curl http://localhost:3333/health`.

## Scripts

| Command          | What it does                               |
| ---------------- | ------------------------------------------ |
| `pnpm dev`       | API and web panel in watch mode            |
| `pnpm dev:kiosk` | Expo dev server                            |
| `pnpm test`      | Unit and integration tests (Vitest)        |
| `pnpm lint`      | ESLint across the monorepo                 |
| `pnpm typecheck` | TypeScript in every package                |
| `pnpm build`     | Production builds of the API and web panel |
| `pnpm format`    | Prettier                                   |

## Engineering rules

- Money is always integer cents. Conversion happens only at the edges (`packages/shared/src/money.ts`).
- Prices are recalculated by the API; the client total is only used to detect price changes.
- Every write that moves money runs in a transaction and is idempotent (`Idempotency-Key`).
- Relevant decisions are recorded in `docs/adr/`.

## License

[MIT](LICENSE)
