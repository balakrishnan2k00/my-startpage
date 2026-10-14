# my-startpage

A local, start.me–inspired personal dashboard: bookmark widgets and a tasks widget. React (Vite) talks to an Express API, which stores data in PostgreSQL.

**Hosted database:** Supabase project **StartPage** (`cebsqfaowzesxryikoeq`, Singapore). Schema and seed data are already applied there.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- PostgreSQL for local dev **or** a [Supabase](https://supabase.com) database connection string

## Quick start (local PostgreSQL)

From `my-startpage` in PowerShell:

```powershell
Copy-Item .env.example .env -Force
npm install
```

Create the app role and database once (`psql` prompts for the `postgres` password):

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -c "CREATE ROLE startpage LOGIN PASSWORD 'startpage';"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -c "CREATE DATABASE startpage OWNER startpage;"
npm run migrate
npm run dev
```

- **Dashboard:** http://localhost:5173
- **API:** http://localhost:3001
- **Health:** http://localhost:3001/api/health → `{ "ok": true, "database": "connected" }`

## Quick start (Supabase database)

1. Open [Supabase → StartPage → Database settings](https://supabase.com/dashboard/project/cebsqfaowzesxryikoeq/settings/database).
2. Copy the **database password** (or reset it if needed).
3. In `.env`, set `DATABASE_URL` to the **Session pooler** URI (port `5432`), with your password:

```env
DATABASE_URL=postgresql://postgres.cebsqfaowzesxryikoeq:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
API_PORT=3001
```

4. Run:

```powershell
npm install
npm run dev
```

Tables and seed widgets are already on Supabase. You only need `npm run migrate` if you add new SQL files under `server/migrations/`.

Row Level Security is enabled on app tables so the public Data API cannot read your data without policies. The Express app uses the direct Postgres connection string and is unaffected.

## Deploy the full app (API + UI)

Supabase hosts the database only. Ship the Node app to a host such as [Render](https://render.com):

1. Push this repo to GitHub.
2. **New → Blueprint** on Render and point at `render.yaml`, or create a **Web Service** with:
   - **Build:** `npm install && npm run build`
   - **Start:** `npm run start -w server` (set `NODE_ENV=production` in the host env; `render.yaml` does this)
3. Set environment variable **`DATABASE_URL`** to the same Supabase Session pooler URI (never commit it).
4. After deploy, open `https://YOUR-SERVICE.onrender.com/api/health`.

`NODE_ENV=production` serves the built React app from the same origin as `/api`, so no separate static host is required.

Optional: set `CORS_ORIGINS` if the UI and API are on different domains.

## Optional: Docker PostgreSQL

Use only when port 5432 is free and you prefer a container:

```powershell
docker compose up -d
npm run migrate
npm run dev
```

## Project structure

| Path | Description |
|------|-------------|
| `client/` | React + TypeScript UI |
| `server/` | Express REST API + SQL migrations |
| `supabase/migrations/` | Same schema applied to the remote Supabase project |
| `render.yaml` | Example production deploy on Render |
| `STORIES.md` | Phased backlog |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | API + Vite client |
| `npm run migrate` | Apply `server/migrations/` |
| `npm run build` | Build client and server |
| `npm run start:prod` | Production server (serves `client/dist` + API) |

## API overview

- `GET /api/health`
- `GET /api/pages/:pageId/dashboard`
- `POST` / `PATCH` / `DELETE` `/api/widgets`, `/api/bookmarks`, `/api/tasks`

Default page id is **1** (`My startpage`).
