# Maios — Amazon Seller Analytics & Automation Platform

Maios is a production-ready, full-stack platform for Amazon (and multi-marketplace)
sellers to track profit, keyword rankings, PPC performance, and competitor prices —
with a background automation engine that reacts to ranking drops, high ACoS, and
competitor price changes.

- **Backend:** Node.js + Express + PostgreSQL (Sequelize ORM), JWT auth, node-schedule workers
- **Frontend:** React 18 + Vite + Zustand + Recharts
- **Marketplaces:** Amazon, eBay, Kaufland, Otto

---

## Architecture

```
Maios/
├── backend/                 # Express API + Sequelize + schedulers
│   └── src/
│       ├── config/          # env config, Sequelize connection
│       ├── models/          # 11 Sequelize models + associations
│       ├── controllers/     # request handlers (7 controllers)
│       ├── routes/          # REST route definitions
│       ├── services/        # business logic (profit, ppc, ranking, price, autoBot…)
│       ├── middleware/      # auth (JWT), error handler, validator, request logger
│       ├── workers/         # node-schedule background jobs
│       ├── migrations/      # sequelize-cli migration (full schema)
│       └── scripts/         # seed, backup, restore, syncDb
└── frontend/                # React SPA
    └── src/
        ├── api/             # axios instance + typed API modules
        ├── store/           # Zustand stores (auth, dashboard, filter)
        ├── pages/           # Dashboard, Keywords, PPC, Listings, Analytics, Settings
        └── components/      # dashboard / keywords / ppc / listings / layout
```

### Data models

`User`, `Product`, `Keyword`, `KeywordRanking`, `DailySales`, `DailyProfit`,
`Competitor`, `CompetitorPriceHistory`, `PPCCampaign`, `PPCPerformance`, `Alert`.

All financial figures (profit, margin, ACoS, ROAS, net revenue) are **calculated**
from underlying sales/PPC data — never hardcoded.

### Automation engine (`services/autoBot.js`)

- Ranking drop (≥5 positions) → raises PPC budgets 15% + alert
- ACoS above target (>120%) → alert (critical if >150%)
- Competitor price drop (≥3%) → price recommendation + alert

Alerts are de-duplicated within a 24h window.

### Scheduled workers (`workers/scheduler.js`)

| Schedule | Job |
| --- | --- |
| `0 2 * * *` (2 AM daily) | Full Amazon data sync + profit recompute |
| `0 * * * *` (hourly) | Track keyword rankings across marketplaces |
| `0 */4 * * *` | Refresh competitor prices / optimize prices |
| `30 */4 * * *` | Optimize PPC bids |
| `0 */6 * * *` | Run automation engine (alerts) |

> Without live Amazon credentials the platform runs in **demo mode**: the
> `amazonService` returns deterministic synthetic data seeded by ASIN/date, so the
> full pipeline (sales → profit → PPC → rankings → alerts) works end to end.

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env          # fill in DB credentials + JWT_SECRET
npm run db:migrate            # create schema (or npm run db:sync in dev)
npm run db:seed               # optional: demo user + 30 days of data
npm run dev                   # http://localhost:5000
```

Demo login after seeding: **demo@maios.app / demo1234**

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_BASE_URL=/api (proxied to :5000 in dev)
npm run dev                   # http://localhost:5173
```

---

## API Reference

Base URL: `/api`. All routes except `/auth/register`, `/auth/login`, and
`/health` require an `Authorization: Bearer <token>` header.

### Auth
- `POST /auth/register` · `POST /auth/login` · `POST /auth/logout`
- `GET /auth/me` · `POST /auth/amazon-connect`

### Products
- `GET /products` · `POST /products` · `GET /products/:id` · `PUT /products/:id` · `DELETE /products/:id`
- `GET /products/:id/stats` · `GET /products/:id/price-recommendation` · `GET|POST /products/:id/competitors`

### Keywords
- `GET /keywords/product/:productId` · `POST /keywords` · `PUT /keywords/:id` · `DELETE /keywords/:id`
- `POST /keywords/research` · `GET /keywords/:id/suggestions`

### Rankings
- `GET /rankings/product/:productId` · `GET /rankings/:keywordId/history` · `GET /rankings/:keywordId/trend`

### Profit
- `GET /profit/daily/:productId` · `GET /profit/monthly/:productId` · `GET /profit/yearly/:productId`
- `GET /profit/forecast/:productId` · `GET /profit/chart`

### PPC
- `GET /ppc/campaigns` · `POST /ppc/campaigns` · `GET /ppc/campaigns/:id` · `PUT /ppc/campaigns/:id`
- `GET /ppc/campaigns/:id/performance` · `POST /ppc/optimize`

### Dashboard
- `GET /dashboard/overview` · `GET /dashboard/profit-chart` · `GET /dashboard/top-products`
- `GET /dashboard/alerts` · `PATCH /dashboard/alerts/:id/dismiss`

---

## Database scripts

```bash
npm run db:migrate           # apply migrations
npm run db:migrate:undo      # roll back
npm run db:sync              # sync models directly (dev)
npm run db:seed              # demo data
npm run db:backup            # pg_dump → backend/backups/
npm run db:restore <file>    # psql restore
```

---

## Deployment

### Backend → Railway
1. Create a Railway project and add the PostgreSQL plugin.
2. Deploy the `backend/` folder from GitHub.
3. Set env vars (`DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `AMAZON_*`).
4. Start command: `npm start` (runs migrations via `npm run db:migrate` in a
   release step, then boots the API + schedulers).

### Frontend → Vercel
1. Import the `frontend/` folder.
2. Set `VITE_API_BASE_URL` to the Railway backend URL (e.g. `https://api.example.com/api`).
3. Auto-deploys on push.

---

## Security

- Passwords hashed with bcrypt; secret fields excluded from the default User scope.
- Stateless JWT auth with per-request validation middleware.
- Helmet, CORS allow-list, gzip compression, and API rate limiting.
- Centralized error handling that never leaks stack traces to clients.
- Every product/keyword/campaign query is scoped to the authenticated user.

## Tech Stack

**Backend:** express, sequelize, pg, jsonwebtoken, bcryptjs, node-schedule,
express-validator, helmet, cors, compression, winston.

**Frontend:** react, react-router-dom, zustand, recharts, axios, vite.
