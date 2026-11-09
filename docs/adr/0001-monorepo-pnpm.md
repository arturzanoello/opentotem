# ADR 0001: Monorepo with pnpm workspaces

- **Status:** accepted
- **Date:** 2026-11-09

## Context

OpenTotem has three apps (kiosk, API, web panel) and two libraries (`shared`, `pos-bridge`). The kiosk, the API and the panel must agree on the same contracts: order payloads, status transitions and money handling. Keeping them in separate repositories would mean publishing internal packages on every change or duplicating types.

## Decision

- One repository with **pnpm workspaces**: `apps/*` and `packages/*`.
- Internal packages export **TypeScript source** (`"exports": "./src/index.ts"`). Vite, Metro and tsup compile them as part of each app, so there is no build step for internal packages.
- `nodeLinker: hoisted`, because React Native's Metro bundler still resolves dependencies best from a flat `node_modules`.
- No Turborepo for now. With 5 packages, `pnpm -r` is fast enough; it can be added later if builds get slow.

## Alternatives considered

- **Separate repositories:** clearer boundaries, but every contract change becomes a publish-and-bump cycle.
- **npm or Yarn workspaces:** work, but pnpm is faster and stricter about undeclared dependencies.
- **Turborepo from day one:** useful caching, but one more tool to configure inside a 21-day plan.

## Consequences

- Changing a shared type breaks the build of every consumer immediately, which is the goal.
- `hoisted` gives up part of pnpm's strictness; ESLint and TypeScript catch most undeclared imports.
- The API is bundled with tsup (`noExternal: [/^@opentotem\//]`) so the production build contains the shared code.
