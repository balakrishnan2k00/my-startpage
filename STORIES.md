# my-startpage — build stories

Track progress by checking boxes as you complete each story. The initial scaffold implements most of stories 1–5; use this list for verification and follow-up work.

---

## 1. Foundation

- [x] Monorepo with `client` and `server` npm workspaces
- [x] `docker-compose.yml` for PostgreSQL 16 on port 5432
- [x] SQL migrations in `server/migrations/` with `npm run migrate`
- [x] Seed: default page **My startpage**
- [x] `GET /api/health` returns database connection status

**Acceptance:** `docker compose up -d`, `npm run migrate`, `curl http://localhost:3001/api/health` → `{ "ok": true }`.

**Files:** `package.json`, `docker-compose.yml`, `server/scripts/migrate.ts`, `server/migrations/001_init.sql`, `server/src/index.ts`

---

## 2. Dashboard read

- [x] `GET /api/pages/:pageId/dashboard` returns page + widgets with nested data
- [x] React loads page id `1` and renders a grid of widgets
- [x] Bookmark widgets show seeded links with favicons

**Acceptance:** Opening http://localhost:5173 shows Education, Entertainment, Government, Research, and Tasks widgets.

**Files:** `server/src/routes/pages.ts`, `client/src/App.tsx`, `client/src/components/WidgetGrid.tsx`, `BookmarkWidget.tsx`

---

## 3. Tasks widget

- [x] `POST/PATCH/DELETE /api/tasks`
- [x] Add task, toggle completed, delete task in UI
- [x] Optimistic updates with rollback on API errors

**Acceptance:** Tasks persist after refresh; completed tasks show struck-through.

**Files:** `server/src/routes/tasks.ts`, `client/src/components/TasksWidget.tsx`

---

## 4. Bookmarks CRUD

- [x] `POST/PATCH/DELETE /api/bookmarks`
- [x] Add link (title + URL) and remove link from a bookmark widget
- [ ] Inline edit bookmark title/URL (optional enhancement)

**Acceptance:** New link opens in a new tab; delete removes row and survives refresh.

**Files:** `server/src/routes/bookmarks.ts`, `client/src/components/BookmarkWidget.tsx`

---

## 5. Add widget

- [x] `POST /api/widgets` for `bookmarks` and `tasks`
- [x] Modal from **+** in top bar
- [x] `PATCH/DELETE /api/widgets` for rename and delete

**Acceptance:** New empty widget appears on the grid; delete removes widget and children.

**Files:** `server/src/routes/widgets.ts`, `client/src/components/AddWidgetModal.tsx`, `TopBar.tsx`

---

## 6. Polish

- [x] Dark theme toggle (persisted in `localStorage`)
- [ ] Drag-and-drop or controls to reorder widgets (`PATCH sort_order`)
- [x] Toast for API errors
- [ ] Loading skeletons instead of plain “Loading…”

**Acceptance:** Theme survives reload; reorder updates order after refresh.

**Files:** `client/src/App.tsx`, `client/src/index.css`, `TopBar.tsx`

---

## 7. Later (optional)

- [ ] Multiple pages (sidebar like start.me **Pages**)
- [ ] Weather widget (external API + caching)
- [ ] RSS / newsfeed widget
- [ ] User accounts and auth
- [ ] Deploy (Docker compose full stack or PaaS)

---

## Local commands

```bash
cp .env.example .env
docker compose up -d
npm install
npm run migrate
npm run dev
```

- App: http://localhost:5173  
- API: http://localhost:3001  
