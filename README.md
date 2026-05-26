# EngineerNest

EngineerNest is a **Next.js (App Router)** MVP foundation for a civil engineering / contractor workflow platform.

## Current MVP scope

- Public responsive marketing site (Bangla + English)
- Admin login and protected admin area
- Admin CRUD for projects, BOQ, reports, documents, content, and company profile
- Admin-managed **material rates** and **estimation configuration**
- Trade-wise + earthwork estimator with editable assumptions
- BNBC-aware site compliance checklist module for admin tracking
- Unit conversion tools and preliminary BNBC-inspired estimator
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
- `/admin/site-compliance`

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

## Pad-based estimate printing

`/estimator` now includes:

- print template selector (Template A and Template B)
- print metadata fields (ref no, date, client name, project name)
- A4-friendly print preview and print action
- estimate table + subtotal/profit/VAT/grand total
- signature/footer area
- preliminary estimate disclaimer (Bangla + English)

Pad template reference images are taken from uploaded documents with categories:

- `pad-template-a`
- `pad-template-b`

## Environment setup

Copy `.env.example` to `.env.local` and update values as needed.

Important placeholders include:

- `ADMIN_GOOGLE_ALLOWLIST`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
