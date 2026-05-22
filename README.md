# EngineerNest

EngineerNest is a **Next.js App Router** foundation for a modern engineering/construction business platform with:

- Public bilingual website (Bangla + English)
- Admin login and protected admin routes
- CRUD-style admin management for projects, BOQ, reports, documents, profile, and content
- Database-ready data layer with current local persistence fallback

## Tech stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Admin login (MVP)

Default starter credentials:

- Username: `fahadshipu`
- Password: `change-me-now`

> This is MVP authentication only. Replace with a production auth system before deployment.

## Available routes

### Public

- `/`
- `/services`
- `/portfolio`
- `/estimator`
- `/resources`
- `/contact`

### Admin

- `/admin/login`
- `/admin/dashboard`
- `/admin/projects`
- `/admin/boq`
- `/admin/reports`
- `/admin/documents`
- `/admin/profile`
- `/admin/content`

## Persistence and database-ready architecture

Current persistence is a local fallback (browser localStorage, in-memory fallback for non-browser runtime) through a centralized abstraction:

- `lib/data-layer.ts` → data access abstraction (`list`, `upsert`, `remove`, `getProfile`, `setProfile`)
- `lib/seed-data.ts` → starter seed data
- `lib/types.ts` → shared domain types

To migrate to a real database later (e.g. Supabase/Postgres):

1. Keep UI pages/components unchanged
2. Replace internals of `lib/data-layer.ts` with DB calls
3. Wire real auth provider to replace MVP credentials and cookie flow

## Environment setup

Copy `.env.example` to `.env.local` and update values as needed.
