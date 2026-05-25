# EngineerNest

EngineerNest is a **Next.js (App Router)** MVP foundation for a civil engineering / contractor workflow platform.

## Current MVP scope

- Public responsive marketing site (Bangla + English)
- Admin login and protected admin area
- Admin CRUD for projects, BOQ, reports, documents, content, and company profile
- Admin-managed **material rates** and **estimation configuration**
- Unit conversion tools and preliminary BNBC-inspired estimator
- Database-ready data abstraction with local persistence fallback

> ⚠️ Estimator disclaimer: all calculations in this MVP are **preliminary estimates only**. Final design, quantities, and costing must be reviewed by a qualified engineer.

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

> This is MVP authentication only. Replace with production-grade auth before deployment.

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
- `/admin/rates`

## Calculation engine foundation

Calculation modules are organized in `lib/calculations/`:

- `conversions`
- `concrete`
- `masonry`
- `plaster`
- `steel`
- `budget`

Estimator and converter UIs consume these modules.

## Persistence and DB-ready architecture

Current persistence uses browser localStorage with in-memory fallback via a central abstraction in `lib/data-layer.ts`.

- Shared app-domain types: `lib/types.ts`
- Seed/default values: `lib/seed-data.ts`
- Data access abstraction: `lib/data-layer.ts`

### Future Supabase path

1. Keep pages/components and form contracts unchanged.
2. Replace data-layer internals with Supabase queries.
3. Keep `lib/types.ts` as the app-domain boundary.

Schema and setup notes:

- `docs/supabase-schema.sql`
- `docs/supabase-integration.md`

## Environment setup

Copy `.env.example` to `.env.local` and update values as needed.

Important placeholders include:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
