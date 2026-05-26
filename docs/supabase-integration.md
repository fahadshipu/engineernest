# Supabase integration notes

EngineerNest currently uses `lib/data-layer.ts` with localStorage/in-memory fallback.

## Migration approach

1. Keep UI pages and form contracts unchanged.
2. Replace `dataLayer` internals with Supabase table queries.
3. Keep `lib/types.ts` as the app-domain contracts and map DB rows to these types.
4. Start with admin-auth replacement (Supabase Auth), then move collection CRUD.

## Implemented auth foundation

- Admin login uses Supabase Google provider from `/admin/login`
- Server validates the Supabase access token via `auth/v1/user`
- Access is restricted to allowlisted emails (`ADMIN_GOOGLE_ALLOWLIST`)
- Current repo default allowlist: `fahad.shipu@gmail.com`

## Environment variables

Use `.env.local`:

- `ADMIN_GOOGLE_ALLOWLIST` (comma-separated emails)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

## Storage notes

- Admin documents currently use a storage abstraction in `lib/file-storage.ts`
- Current provider: local data-url persistence for MVP
- Upload categories include `pad-template-a` and `pad-template-b` for print header references
- Future Supabase Storage migration can replace `uploadAdminFile` internals without changing admin UI

## Tables

Use `docs/supabase-schema.sql` as the starting schema for:

- profile/content/projects/boq/reports/documents
- material rates and estimator configuration

All estimator output remains preliminary and must be reviewed by a qualified engineer.
