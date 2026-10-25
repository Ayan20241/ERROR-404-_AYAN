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

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`: from the Supabase project API settings, or the local values shown by `npm exec -- supabase status`.
- `SUPABASE_SERVICE_ROLE_KEY`: the service-role key from the same Supabase API settings or local status output. Server-only; never use a `NEXT_PUBLIC_` prefix or share this value.
- `NEXT_PUBLIC_APP_URL`: `http://localhost:3000` for local development; set this to the canonical application origin outside local development.
- `NEXT_PUBLIC_MAP_STYLE_URL` is optional; it defaults to the free OpenFreeMap Liberty style.

Useful checks are `npm run test`, `npm run lint`, `npm run typecheck`, and `npm run build`. `npm run test:e2e` is not currently configured. The Next.js UI and API are served by the same origin; state-changing auth requests enforce same-origin checks and API routes intentionally do not enable wildcard CORS.

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

The target commands are `npm run dev`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`, and `npm run build`. The current package does not define `test:e2e` or a database migration script. Report any command that has not been implemented or run rather than implying success.

## Backend foundation

The initial backend-only setup, environment configuration, API conventions, and phased implementation plan are documented in [docs/BACKEND_SETUP.md](./docs/BACKEND_SETUP.md).

## Critical database rule

Registration and cancellation must be atomic database operations. Keep registration history but allow at most one active registration per attendee/event. Use a partial unique index on active rows and a tested transaction/function that updates `registered_count` exactly once. Do not rely on client-side checks or multiple independent HTTP calls for capacity safety.
