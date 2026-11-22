# Project plan

Status and remaining work, compared against the spec (`TZ-CRM-School.pdf`). One day = 4–8 hours of work.

## Done

**Backend (`app/`, Express + TypeScript + Mongoose)**
- Server setup: Express config, error handling, env validation
- Auth: sign-in, token refresh (single use), sign-out, `GET /auth/me`; tokens stored in the DB, bans apply immediately
- Roles `admin` / `manager`; super admin `admin@gmail.com` / `admin` seeded on startup
- User and order models, allowed values for status / course / course type / course format
- `GET /orders`: 25 per page, sort by any column with `?order=±field`, default `-id`
- 30-minute action token type exists (not used yet)

**Frontend (`web/`, React 19 + Vite + Tailwind)**
- Login page, routing, role-based redirects
- Automatic token refresh on 401
- Header: user name, Admin button (admins only), Logout
- Orders table with click-to-sort headers, `?page` / `?order` in the URL; simple Prev/Next paging
- Admin and Activate pages are placeholders

**Infrastructure**
- Docker Compose (MongoDB, API, nginx frontend), README setup steps

## Missing
- Cloud MongoDB cluster (spec requires it; only local Docker DB now)
- Orders dump not imported (`dumps/` is empty)
- Filters, Excel export, expandable row, comments, taking an order into work, edit form, groups, admin panel, statistics, activation / password recovery, API docs, Postman collection

## Day-by-day plan

- [ ] **Day 1 — Data and paginator.** Create a MongoDB Atlas cluster and import `orders.dump`. Check real field names and types (`created_at`, `manager`, `group`). Run the app against it end to end. Replace Prev/Next with the §4.1 paginator (all 4 visual modes).
  - [x] Dump analysed: a mongosh script with 500 orders, no `id`, `already_paid` instead of `alreadyPaid`, empty strings, no `manager` / `group`, `status` / `sum` / `already_paid` always null
  - [x] `npm run import:orders` (normalizes the dump; validated offline: all 500 pass the schema)
  - [x] 4-mode paginator, out-of-range `?page` opens the last page
  - [ ] Create the Atlas cluster and put its URI in `app/.env` (needs your account)
  - [ ] Run the import and click through the app (blocked on Docker / Atlas)
  - Decision for day 2: the dump has no `manager` / `group` data, so they can be stored as refs (user id / group id) from the start
- [ ] **Day 2 — Backend filters (§8).** All 12 filter fields: text fields match anywhere, case-insensitive; enum filters, age, start/end date range, `my=true`. Decide how `manager` and `group` are stored (strings from the dump vs. refs to users / groups). Add indexes.
- [ ] **Day 3 — Frontend filter panel.** Debounced text inputs, dropdowns, date pickers, all synced to the URL. My checkbox, reset button, refresh button.
- [ ] **Day 4 — Groups and Excel.** List groups, add group with a unique name. Excel export respecting current filters; authenticated download button.
- [ ] **Day 5 — Backend editing rules (§6–7).** Comments (author, date, text). Shared ownership check: only the assigned manager, or anyone if unassigned, may change an order. A comment assigns the manager and sets status to In work if it was null / New. Edit endpoint with validation; status New frees the order.
- [ ] **Day 6 — Frontend expanded row.** Click an order to show Message, UTM, comment history and a comment form; form disabled for others' orders; table refreshes after a comment.
- [ ] **Day 7 — Edit form (§7).** Modal with all 12 optional fields, group dropdown with ADD GROUP, validation, Close / Submit, error messages.
- [ ] **Day 8 — Backend admin (§10).** Overall and per-manager statistics by status. Create manager; list managers newest first with paging; ban / unban (also logs the manager out).
- [ ] **Day 9 — Frontend admin panel.** Statistics block, Create form (Email, Name, Surname), manager cards with paging.
- [ ] **Day 10 — Activation and recovery (§11).** 30-minute single-use link; Activate / Recovery password buttons copy it to the clipboard. Activate page with Password + Confirm Password, then redirect to login. Test the full flow with a new manager.
- [ ] **Day 11 — Docs (§2.3).** Swagger / OpenAPI docs, Postman collection file in the repo, README rewrite with exact versions and steps for someone outside the Node stack. If MySQL is added, justify it in the README.
- [ ] **Day 12 — Testing and buffer.** Compare every feature with `http://bigbird.space:82`; edge cases (expired link, banned manager, bad URL params); bug fixes; check `docker compose up --build` on a clean machine.

Notes:
- Total ≈ 12 days (~2½ weeks at 5 days/week); the spec allows 60 days.
- Day 1 is the biggest risk: the dump's real format decides how `manager` and `group` are stored, which affects days 2–8.
- Days 8–10 don't depend on days 2–7 and can be done first.
