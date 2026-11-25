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

Use either a MongoDB Atlas cluster (required by the spec) or a local MongoDB in Docker for development.

**Option A: MongoDB Atlas (cloud)**

1. Create a free cluster at https://cloud.mongodb.com.
2. Under **Database Access**, add a database user with a password.
3. Under **Network Access**, allow your IP address. Use `0.0.0.0/0` if the whole team needs access.
4. Click **Connect → Drivers** and copy the connection string. Add the database name `crm` before the `?`:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/crm?retryWrites=true&w=majority`
5. Put it into `MONGO_URI` in `app/.env`.

**Option B: local MongoDB in Docker**

```bash
docker compose up -d database
```

It listens on `localhost:27017` (user `admin`, password `verysecretpassword`, database `crm`). Data is kept in `./mongo-data`. The default `MONGO_URI` in `app/.env.example` points here.

**Import the orders dump** (works with both options, uses `MONGO_URI` from `app/.env`):

1. Download [orders.dump](https://raw.githubusercontent.com/OktenSchool/dumps/main/final/orders.dump) into the `dumps/` folder (the file is git-ignored).
2. Run:

```bash
cd app
npm install
npm run import:orders
```

The dump is a mongosh script, not a `mongorestore` archive, and its records have no numeric `id`. The import script parses it and assigns ids `1..500` in date order. It also renames `already_paid` to `alreadyPaid`, turns empty strings into `null` and stores `created_at` as a date. It refuses to import into a non-empty `orders` collection. To replace existing orders, run `npm run import:orders -- --drop`.

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

In Docker the API connects to the `database` container: `docker-compose.yml` overrides `MONGO_URI` from `app/.env`. To run the Docker API against Atlas, change `MONGO_URI` under `app.environment` in `docker-compose.yml`.

## API

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | – | Health check |
| POST | `/auth/sign-in` | – | `{ email, password }` → `{ user, tokens }` |
| POST | `/auth/refresh` | – | `{ refreshToken }` → new token pair (refresh tokens are single use) |
| POST | `/auth/sign-out` | Bearer | Removes the current token pair |
| GET | `/auth/me` | Bearer | Current user |
| GET | `/orders?page=1&order=-id` | Bearer | Orders, 25 per page, sorted by `order` (`-` = DESC), with optional filters (below) |
| GET | `/orders/excel?order=-id` | Bearer | All orders matching the same filters and sort, as an `.xlsx` file |
| GET | `/groups` | Bearer | All groups `[{ _id, name }]`, sorted by name |
| POST | `/groups` | Bearer | `{ name }` → new group (201); a name that exists in any letter case → 409 |

`GET /orders` and `GET /orders/excel` filters (all optional, combined with AND; an empty value such as `?name=` is ignored):

| Param | Match |
|---|---|
| `name`, `surname`, `email`, `phone` | Substring, case-insensitive (`?name=ол` finds Олег, Олена, Володимир) |
| `age` | Exact number |
| `course`, `course_format`, `course_type` | Exact value from the allowed lists |
| `status` | Exact value; `New` also matches orders with no status |
| `group` | Group name, case-insensitive; an unknown group returns no orders |
| `start_date`, `end_date` | `YYYY-MM-DD`, both inclusive, compared in UTC |
| `my` | `true` → only orders assigned to the current user |

In responses, `manager` is `{ _id, name, surname }` and `group` is `{ _id, name }` (or `null`). Sorting by `manager` sorts by surname, by `group` by group name.

## TODO

- [ ] Expandable order row, comments, take order in work (section 6)
- [ ] Edit modal with ADD GROUP (section 7)
- [ ] Admin panel: statistics, create manager, ban/unban (section 10)
- [ ] Activate / recovery password links (section 11)
- [ ] Postman collection, API docs
