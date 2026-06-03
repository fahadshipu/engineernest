# EngineerNest

EngineerNest is a **Next.js (App Router)** MVP foundation for a civil engineering / contractor workflow platform.

## Current MVP scope

- Public responsive marketing site (Bangla + English)
- Admin login and protected admin area
- Admin CRUD for projects, BOQ, reports, documents, content, and company profile
- Daily work log management with project-linked photos, weather, labor, progress notes, and remarks
- Project execution tracking with timeline / Gantt-style stage cards and overall progress percentage
- Inventory / stock management with received, consumed, and remaining quantity visibility
- Separate engineer/admin and client dashboard experiences
- Admin-managed **material rates** and **estimation configuration**
- Admin-only customizable estimator with editable sections/items and print/export support
- BNBC-aware site compliance checklist module for admin tracking
- Unit conversion tools and preliminary BNBC-inspired calculation modules
- Database-ready data abstraction with local persistence fallback

> ⚠️ Estimator disclaimer: all calculations in this MVP are **preliminary estimates only**. Final design, quantities, and costing must be reviewed by a qualified engineer.
>
> ⚠️ Site compliance disclaimer: the site module is **BNBC-aware checklist guidance**, not a certified legal/code compliance engine.

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

## Admin login (Google allowlist)

Admin access uses **Supabase Auth (Google)** and an allowlisted email check.

- Default allowlist in this repo: `fahad.shipu@gmail.com`
- Allowlist env: `ADMIN_GOOGLE_ALLOWLIST` (comma-separated)

### Login flow

1. User clicks **Continue with Google** on `/admin/login`.
2. The login form generates a PKCE code verifier + challenge (Web Crypto API), stores the verifier in a short-lived cookie (`engineernest_pkce_verifier`, 5 min), and redirects the browser to Supabase's OAuth authorize endpoint with `code_challenge` and `code_challenge_method=s256`.
3. Supabase redirects the user to the Google OAuth consent screen.
4. After consent, Google redirects back to Supabase, which then redirects to `/auth/callback?code=AUTHORIZATION_CODE` (code is in the **query string**, not the hash).
5. The server-side `/auth/callback` Route Handler:
   a. Reads the authorization code from the query string.
   b. Reads the PKCE code verifier from the `engineernest_pkce_verifier` cookie.
   c. Exchanges both with Supabase's token endpoint (`POST /auth/v1/token?grant_type=pkce`).
   d. Validates that the returned user email is on the admin allowlist.
   e. Sets a secure `httpOnly` session cookie (`engineernest_admin_token`) and redirects to `/admin/dashboard`.
6. If anything fails (wrong email, expired code, denied consent), the user is redirected back to `/admin/login` with a clear error message.

If Supabase env vars are missing, admin login is blocked with an explicit setup message.

> **Why PKCE?**  
> The previous implementation used `response_type=token` (implicit flow), which returns the access token in the URL hash and relies on client-side JavaScript to read and forward it.  This is brittle — newer Supabase projects default to PKCE, and the hash-reading / cookie-setting race caused repeated login-loop failures.  
> PKCE is the current OAuth 2.0 best practice: the authorization code travels in the query string, and the exchange happens entirely server-side.

### Required Supabase configuration

In your **Supabase project dashboard → Authentication → URL Configuration → Redirect URLs** add:

```
http://localhost:3000/auth/callback
https://<your-production-domain>/auth/callback
```

> Without these entries Supabase will reject the OAuth redirect with a `redirect_uri_mismatch` error.

## Available routes

### Public

- `/`
- `/services`
- `/portfolio`
- `/resources`
- `/contact`

### Admin

- `/admin/login`
- `/admin/dashboard`
- `/admin/projects`
- `/admin/work-logs`
- `/admin/inventory`
- `/admin/boq`
- `/admin/reports`
- `/admin/documents`
- `/admin/profile`
- `/admin/content`
- `/admin/rates`
- `/admin/site-compliance`
- `/admin/estimator`

### Client

- `/client/dashboard`

## Calculation engine foundation

Calculation modules are organized in `lib/calculations/`:

- `conversions`
- `concrete`
- `masonry`
- `plaster`
- `steel`
- `budget`
- `earthwork`

Estimator and converter UIs consume these modules.

## Persistence and DB-ready architecture

Current persistence uses browser localStorage with in-memory fallback via a central abstraction in `lib/data-layer.ts`.

- Shared app-domain types: `lib/types.ts`
- Seed/default values: `lib/seed-data.ts`
- Data access abstraction: `lib/data-layer.ts`

The data layer now includes DB-ready collections for:

- project stages / progress percentages
- daily work logs
- inventory stock items
- route-driven dashboard role views

### Future Supabase path

1. Keep pages/components and form contracts unchanged.
2. Replace data-layer internals with Supabase queries.
3. Keep `lib/types.ts` as the app-domain boundary.

Schema and setup notes:

- `docs/supabase-schema.sql`
- `docs/supabase-integration.md`

## Admin file uploads

`/admin/documents` supports:

- file upload (images/PDF/docs/sheets)
- URL-based document entry
- metadata (`title`, `type`, `category`)
- delete action
- inline image preview when applicable

Categories include project images, drawings, invoices, estimate PDFs, company documents, and pad template A/B references.

Current MVP storage provider is local data-url persistence through an upload abstraction (`lib/file-storage.ts`) so Supabase Storage can be wired later without changing the form contract.

The same upload abstraction is reused for **daily work log photos**, so site images can stay in the current MVP flow while remaining ready for future Supabase Storage migration.

## Project operations features

### Daily work logs

`/admin/work-logs` provides a practical engineer/admin UI for:

- selecting the project and date
- recording bilingual work summaries and progress notes
- tracking labor / worker count and weather condition
- attaching daily site photos
- storing optional remarks
- reviewing logs by project and day with a list/detail layout

### Timeline / project progress

`/admin/projects` and `/admin/dashboard` now support:

- project start / end dates
- overall progress percentage
- stage-wise timeline cards with start/end/status/progress
- client-facing progress visibility on `/client/dashboard`

This is a lightweight MVP timeline / Gantt-style planner built with existing UI primitives rather than a heavy chart dependency.

### Inventory / stock logic

`/admin/inventory` supports:

- quantity received (stock-in)
- quantity consumed (stock-out)
- automatic remaining stock calculation (`received - consumed`)
- optional unit rate, supplier, and remarks

### Engineer/admin vs client dashboards

- `/admin/dashboard` is the editable internal operations view for engineers/admins
- `/client/dashboard` is the restricted read-only client view focused on project status, timeline, photos, and cost visibility

> MVP role model note: role separation is currently expressed through route/view abstractions and UI capabilities. Full multi-user role enforcement is future-ready but not yet backed by a dedicated auth/authorization store.

## Admin custom estimator

`/admin/estimator` now provides:

- admin-only custom estimate builder
- dynamic sections and line items (add/remove)
- editable item name/description/unit/rate/quantity/totals
- subtotal, tax, additional charge, discount, and grand total
- optional estimate metadata (ref/date/client/project/site) and remarks
- print action with clean print window output
- CSV export for estimate line items and totals

## Environment setup

Copy `.env.example` to `.env.local` and update values as needed.

Important placeholders include:

- `ADMIN_GOOGLE_ALLOWLIST`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
