# Supabase integration notes (planned)

EngineerNest currently uses `lib/data-layer.ts` with localStorage/in-memory fallback.

## Migration approach

1. Keep UI pages and form contracts unchanged.
2. Replace `dataLayer` internals with Supabase table queries.
3. Keep `lib/types.ts` as the app-domain contracts and map DB rows to these types.
4. Start with admin-auth replacement (Supabase Auth), then move collection CRUD.

## Environment variables

Use `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

## Tables

Use `docs/supabase-schema.sql` as the starting schema for:

- profile/content/projects/boq/reports/documents
- material rates and estimator configuration

All estimator output remains preliminary and must be reviewed by a qualified engineer.
