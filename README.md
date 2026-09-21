# Trade Journal

Log trades, track P&L, and filter your history by date range.

Stack: Next.js (App Router) + Postgres + Drizzle ORM + Clerk auth + Tailwind + Recharts.

## Demo

<img width="1071" height="816" alt="Screenshot 2026-09-21 at 14 55 28" src="https://github.com/user-attachments/assets/ab51d671-8287-486b-b346-e8ca31efb8f4" />

## Setup

1. **Install dependencies** (already done if you just scaffolded this)

   ```bash
   npm install
   ```

2. **Start Postgres** via Docker Compose

   ```bash
   docker compose up -d
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` (already created for local dev) and fill in your Clerk keys:

   - Create a free app at [dashboard.clerk.com](https://dashboard.clerk.com)
   - Copy the Publishable Key and Secret Key into `.env` as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

   `DATABASE_URL` already points at the Docker Compose Postgres instance by default.

4. **Push the schema to the database**

   ```bash
   npm run db:push
   ```

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000), sign up, then add a trade.

## Project structure

- `src/db/schema.ts` — Drizzle schema for the `trades` table
- `src/lib/trades.ts` — data access + P&L/stat calculations
- `src/app/trades` — trade list, add/edit forms, server actions (create/update/delete)
- `src/app/dashboard` — P&L stats and equity curve, filterable by date range
- `src/middleware.ts` — Clerk route protection (everything except `/sign-in`, `/sign-up`)

## Useful scripts

- `npm run db:generate` — generate SQL migration files from schema changes
- `npm run db:push` — push schema changes straight to the database (fastest for local dev)
- `npm run db:studio` — open Drizzle Studio to browse data
