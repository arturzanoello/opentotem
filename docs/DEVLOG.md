# Devlog

One entry per day. Short and honest: these entries become interview stories.

## Template

```
## Day N (YYYY-MM-DD) · X h

**Done:**
**Stuck on:**
**How I solved it:**
**Learned:**
**Tomorrow:**
```

## Day 1 (2026-11-09) · 3 h

**Done:** monorepo with pnpm workspaces, TypeScript, ESLint, Prettier, Docker Compose with PostgreSQL, CI on every pull request and push to `main`; skeletons for the API (`/health`), the web panel and the Expo kiosk; `shared` package with money helpers and the order status machine; `pos-bridge` contract types. `GET /health` answers `{"status":"ok","db":"ok"}` with the PostgreSQL container running.

**Stuck on:**

- A quiet day. The first `git push` was rejected because my personal access token did not have the `workflow` scope.

**How I solved it:**

- Added the `workflow` scope to the token. GitHub requires it because a workflow runs code with access to the repository secrets, so a token that can edit `.github/workflows/` could leak them.

**Learned:**

- Docker basics: an image is a fixed version of a program (`postgres:16-alpine`), a container is that image running, and a volume (`pgdata`) keeps the data when the container is removed.
- `ports: '5432:5432'` maps a port on my machine to the container, which is why the API reaches the database at `localhost:5432`.
- Scripts in `/docker-entrypoint-initdb.d` (our `init.sql`, which creates `opentotem_test`) run only when the volume is empty. `docker compose down` keeps the data; `docker compose down -v` deletes it.
- Why Docker only for the database: anyone can start the same PostgreSQL 16 with one command, and it is the same image the CI uses. During development the API runs directly on Node, which gives faster reloads and easier debugging.

**Tomorrow:** Drizzle schema and migrations; Café Oeste seed.
