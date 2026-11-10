# CRM Programming School

A CRM for processing course applications (orders), built as the Okten final project. The spec is in `TZ-CRM-School.pdf`.

- **app/**: REST API. Node.js, Express 5, TypeScript, MongoDB (Mongoose), Zod
- **web/**: React 19 + Vite + Tailwind frontend, served by nginx in Docker
- **docker-compose.yml**: MongoDB, plus the API and frontend

## Requirements

| Tool | Version |
|---|---|
| Node.js | 22+ |
| npm | 10+ |
| Docker Desktop | 28+ (with Docker Compose v2) |

## Getting started

### 1. Environment

```bash
cp app/.env.example app/.env
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGO_URI` | yes | – | MongoDB connection string (local docker or Atlas cluster) |
| `PORT` | no | `5000` | API port |
| `TRUST_PROXY` | no | `0` | Number of reverse proxies in front of the API (`1` behind nginx) |
| `FRONTEND_URL` | no | `http://localhost:5173` | Allowed CORS origin |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` / `JWT_ACTION_SECRET` | yes | – | Token secrets |
| `JWT_ACCESS_LIFETIME` / `JWT_REFRESH_LIFETIME` | yes | – | Token lifetimes in **milliseconds** |
| `JWT_ACTION_LIFETIME` | no | `1800000` | Activate / recovery link lifetime (30 min) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | no | `admin@gmail.com` / `admin` | Super admin created on startup |

### 2. Database

Start only MongoDB in Docker:

```bash
docker compose up -d database
```

It listens on `localhost:27017` (user `admin`, password `verysecretpassword`, database `crm`). Data is kept in `./mongo-data`.

Restore the orders dump (https://github.com/OktenSchool/dumps/blob/main/final/orders.dump): put `orders.dump` into `./dumps`, then:

```bash
docker compose exec database mongorestore --username admin --password verysecretpassword --authenticationDatabase admin --nsInclude "*.orders" --nsFrom "*.orders" --nsTo "crm.orders" --archive=/dumps/orders.dump
```

If the file is not an archive (mongorestore reports an error), try adding `--gzip`, or restore a folder dump with `mongorestore ... /dumps/<folder>`.

### 3. Run locally (dev)

```bash
cd app
npm install
npm run dev
```

```bash
cd web
npm install
npm run dev
```

Open http://localhost:5173 and sign in with `admin@gmail.com` / `admin`. The Vite dev server proxies `/api/*` to the API on port 5000.

### Run everything in Docker

```bash
docker compose up --build
```

Frontend: http://localhost:5173. API (for Postman): http://localhost:5000.

## API

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | – | Health check |
| POST | `/auth/sign-in` | – | `{ email, password }` → `{ user, tokens }` |
| POST | `/auth/refresh` | – | `{ refreshToken }` → new token pair (refresh tokens are single use) |
| POST | `/auth/sign-out` | Bearer | Removes the current token pair |
| GET | `/auth/me` | Bearer | Current user |
| GET | `/orders?page=1&order=-id` | Bearer | Orders, 25 per page, sorted by `order` (`-` = DESC) |

## TODO

- [ ] Order filters (section 8) and Excel export
- [ ] Expandable order row, comments, take order in work (section 6)
- [ ] Edit modal and groups (section 7)
- [ ] Admin panel: statistics, create manager, ban/unban (section 10)
- [ ] Activate / recovery password links (section 11)
- [ ] Paginator with the 4 visual modes (section 4.1)
- [ ] Postman collection, API docs
