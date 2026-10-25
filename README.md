# Hyperlocal Events — Development Specification Pack

This pack contains the revised project requirements for development. `AGENTS.md` belongs at the repository root; place all files in `docs/` in the repository `docs/` directory.

## Run the integrated application

The integrated app is a single Next.js application. Its UI uses same-origin `/api/...` Route Handlers, so no separate Vite server, API base URL, or CORS configuration is required.

1. Use Node.js 20.9 or newer and npm.
2. Install the locked dependencies with `npm ci`.
3. In PowerShell, copy the template only when you do not already have a local file: `if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }`. Fill in the Supabase values listed below; existing `.env.local` files are preserved.
4. Start the application with `npm run dev` and open `http://localhost:3000`.

The `Frontend` branch was a Vite prototype with hard-coded sample events and a simulated map; it had no API, Supabase, or Gemini calls. The integrated runtime uses the existing Next.js pages and same-origin API instead of presenting that sample content as live event data. The Vite prototype remains available in the merged `Frontend` branch history.

Required values in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: from the Supabase project API settings, or the local values shown by `npm exec -- supabase status`. Existing projects may continue using `NEXT_PUBLIC_SUPABASE_ANON_KEY`; set only one public key variable.
- `SUPABASE_SERVICE_ROLE_KEY`: the service-role key from the same Supabase API settings or local status output. Server-only; never use a `NEXT_PUBLIC_` prefix or share this value.
- `NEXT_PUBLIC_APP_URL`: `http://localhost:3000` for local development; set this to the canonical application origin outside local development.
- `NEXT_PUBLIC_MAP_STYLE_URL` is optional; it defaults to the free OpenFreeMap Liberty style.

The discovery page supports list/map switching. The map uses MapLibre and the keyless OpenFreeMap Liberty style by default; it plots only published events that have coordinates, does not request the attendee's location, and falls back to the event list if coordinates or map tiles are unavailable. Set `NEXT_PUBLIC_MAP_STYLE_URL` only when changing to another compatible style. Check that provider's terms, availability, tile limits, and attribution before staging.

## Tests

```powershell
npm run test
npm run lint
npm run typecheck
npm run build
npm exec -- playwright install chromium
npm run test:e2e
```

Vitest unit tests run without Supabase. The local Supabase integration suite is skipped unless all five `SUPABASE_TEST_*` values are supplied; it refuses non-loopback API/database endpoints and a project ID other than `hyperlocal-events`. It creates isolated test users/events and removes only those IDs. Start the local Supabase project with `npm exec -- supabase start`, inspect `npm exec -- supabase status` privately, and provide those values to the test process using the instructions in [docs/BACKEND_SETUP.md](./docs/BACKEND_SETUP.md). Never paste status output into logs or chat.

Playwright tests start a separate local Next.js server on port 3101 and mock API responses. They cover public event rendering, map/list fallback, MapLibre marker rendering with a mocked style, discovery API failure/retry, and safe auth error rendering. They do **not** prove real Supabase authentication, RLS, registration transactions, or external map tile-provider availability. There is no production account or seed data.

The Next.js UI and API are served by the same origin; state-changing auth requests enforce same-origin checks and API routes intentionally do not enable wildcard CORS. `GET /api/health` is process liveness only, not a database readiness check.

## Staging deployment plan

1. Create a **separate Vercel staging project** or use a protected Preview deployment, and a separate Supabase staging project. Do not connect the staging app to production data.
2. Configure the five variables above in the staging environment. Use the staging Supabase URL, publishable (or legacy anon) key, and server-only service-role key. Set `NEXT_PUBLIC_APP_URL` to the exact HTTPS staging origin. Add that origin to Supabase Auth's Site URL/redirect allowlist. Use a verified, keyless map style URL or keep the default.
3. Before any migration, review the complete migration diff and confirm the CLI is linked to the intended **staging** project. Back up the staging database (Supabase backup/export, or `pg_dump` where supported) and record the migration list. Never run `supabase db reset` against shared/staging/production data.
4. Apply the numbered migrations to staging only after the backup and target project are verified; confirm all five appear in the remote migration list. Migrations are forward-only; fix mistakes with a reviewed forward migration. Restore a backup only as an explicitly approved recovery action.
5. Deploy the branch as a Preview, run unit/lint/type/build and Playwright checks, then perform a fresh-browser smoke test: sign-up/confirmation, sign-in/out, public discovery/details, organizer publish/edit, attendee registration/cancel/duplicate/capacity, RLS cross-account checks, and location/map fallback.
6. Check HTTPS, the security response headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and production HSTS), `/api/health`, and the authenticated/database smoke checks. `/api/health` alone does not establish readiness.
7. Roll back an application release by redeploying the previous Vercel deployment. Do not automatically reverse database changes; use a reviewed forward fix, or restore the verified backup only with explicit approval and an understood recovery-point impact.

Public production deployment, DNS/infrastructure changes, and applying migrations to a production Supabase project require explicit approval. No production deploy has been performed.

## Document authority

1. `docs/PRD.md` defines product scope and acceptance criteria.
2. `docs/TRD.md` defines the approved stack, endpoints, environment, and integration contracts.
3. `docs/SECURITY.md` is authoritative for security; security takes precedence over convenience.
4. `docs/DATABASE.md` defines schema, constraints, migrations, and transaction requirements.
5. `docs/ARCHITECTURE.md` defines module boundaries and data flow.
6. `docs/DESIGN_SYSTEM.md`, `docs/CODE_STYLE.md`, and `docs/TESTING.md` define UI, conventions, and verification.
7. Root `AGENTS.md` instructs coding agents how to apply the documents.

If two documents conflict, do not silently guess: flag the exact conflict, choose the safer behavior temporarily, and report it. Update related documents together when a contract changes.

## Before coding

- Verify the actual repository state and preserve working code.
- Use Node.js LTS supported by the selected Next.js release and npm.
- Verify compatible package versions, install dependencies, and commit `package-lock.json`.
- Configure `.env.local` from `.env.example`; never commit secrets.
- Create and apply numbered Supabase migrations to a fresh project; verify RLS before using real demo accounts.
- Confirm the demo city and create clearly labelled seed data.
- Deploy a thin working slice early.

## Required commands

The target commands are `npm run dev`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`, and `npm run build`. Playwright is configured; there is no npm database-migration script. Apply remote migrations only through the Supabase CLI after verifying the selected non-production project.

## Backend foundation

The initial backend-only setup, environment configuration, API conventions, and phased implementation plan are documented in [docs/BACKEND_SETUP.md](./docs/BACKEND_SETUP.md).

## Critical database rule

Registration and cancellation must be atomic database operations. Keep registration history but allow at most one active registration per attendee/event. Use a partial unique index on active rows and a tested transaction/function that updates `registered_count` exactly once. Do not rely on client-side checks or multiple independent HTTP calls for capacity safety.
