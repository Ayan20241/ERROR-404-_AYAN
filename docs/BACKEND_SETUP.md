# Backend Setup and Implementation Plan

## Current foundation

The repository began as a specification pack with no application source, package manifest, tests, environment template, or database migrations. The application now follows the documented single Next.js App Router architecture and includes a responsive frontend connected to the backend API.

Implemented:

- A minimal Next.js/TypeScript project and npm scripts for development, build, lint, type checking, and Vitest.
- Zod-based server environment parsing, using the five variables defined in TRD.md §9. Configuration errors list invalid variable names only and never include values.
- A typed `AppError` and standard `{ error: { code, message } }` JSON response mapping.
- Shared JSON/query parsing helpers and a validated event discovery query shape.
- `GET /api/health`, which reports process liveness only and does not claim Supabase/database readiness.
- Supabase SSR server client and same-origin email/password auth endpoints, with HttpOnly session cookies refreshed by the Next.js 16 `proxy.ts`.
- Server-side authentication, role, and event-ownership guards. Role is loaded from `profiles`; request payloads cannot set it.
- Core API handlers for public event search/details, attendee-owned registration history, profile preferences, attendee registration/cancellation, organizer promotion, and organizer-owned event creation, listing, editing, cancellation, and attendee display.
- Forward-only `003_core_api.sql` adds SQL-paginated public search, safe attendee-to-organizer promotion, and transactional event update/cancellation notifications.
- Engagement and insights APIs cover saved events, private notifications/read state, eligible feedback, organizer attendance, real organizer/platform statistics, admin moderation removal/restore, and deterministic SmartMatch recommendations.
- Forward-only `004_engagement_and_insights.sql` adds deduplicated signed-in event views, private moderation state, and narrowly granted role-checked database functions for saves, aggregates, and moderation.
- Forward-only `005_india_location_catalog.sql` adds the India state/UT and curated city catalog, nullable structured event location references, location-filtered SQL search, and compatible organizer location updates.
- Mocked unit tests for auth input, error mapping, session handling, cookie flags, and authorization guards. A local-only database integration suite exercises RLS and registration behavior when explicitly enabled.

The app has no browser Supabase client because auth cookies are HTTP-only; browser authentication goes through same-origin Route Handlers. A server-only service-role client is used only after session verification to record event views; user-facing admin operations still use the caller's session and role-checked database functions.
The initial database schema, RLS policies, and transaction functions exist as numbered migrations. They were applied to the current local instance before this Phase 3 work; the auth work does not replay them.
Playwright and generated database types remain deferred. The local Supabase CLI is available as an npm dev dependency.

## Local setup

1. Use Node.js 20.9 or newer and npm.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local` and replace placeholders only with local CLI values or credentials from an explicitly approved Supabase project. Never commit `.env.local`.
4. Run `npm run dev`.
5. Check `http://localhost:3000/api/health` for the process liveness response.

The health endpoint intentionally does not load environment configuration or contact Supabase. A successful health response does not prove that credentials, authentication, or the database are available.

## Local database foundation

The Supabase CLI is available through the project's npm dev dependency, and local development uses Docker. The current `supabase/config.toml` targets PostgreSQL 17. From the repository root:

1. Run `npm exec -- supabase start` to start the local Supabase stack.
2. Run `npm exec -- supabase status` to verify the endpoints and container state. Do not paste its output publicly; it includes local development credentials.
3. Use `npm exec -- supabase migration list --local` to inspect migration history without applying migrations.
4. `npm exec -- supabase db reset` is destructive and is not required for the tests described below. Never run it against data that must be preserved.

Do not link the local verification workflow to a shared or production project. Runtime integration tests require the endpoint to be loopback on port 54321 and use temporary users/events with scoped cleanup.

There is no seed file. The demo city remains undecided; no demonstration accounts are created by migrations.

## Authentication API

- `POST /api/auth/signup` accepts `{ email, password, displayName? }`. Supabase Auth creates the account; the migration trigger creates the `profiles` row. The response returns only user ID/email and whether a session was issued. Configure Supabase Auth's Site URL and redirect allowlist for local/approved app origins.
- `POST /api/auth/signin` accepts `{ email, password }`; session tokens are written to HttpOnly cookies and are never included in JSON.
- `POST /api/auth/signout` ends the server-side Supabase session.
- `GET /api/auth/session` verifies the current user and reads the role from `profiles`; absent/expired sessions return `{ user: null, role: null }`.
- `GET /api/auth/callback` exchanges Supabase's one-time code for a session. Redirects are restricted to local relative paths.

State-changing auth requests require an exact same-origin `Origin` header. Cookies use `HttpOnly`, `SameSite=Lax`, `Path=/`, and `Secure` in production. `proxy.ts` calls `getClaims()` to refresh sessions; `/api/health` is excluded so process liveness does not depend on Supabase configuration.

`requireAuthenticatedUser`, `requireRole`, and `requireEventOwnership` in `lib/server/auth/guards.ts` derive identity from verified Supabase Auth and load role/ownership from the database. Core API routes use these checks; the database grants prevent authenticated users from directly updating `profiles.role`.

Core API handlers use these guards and database RLS. The profile patch schema does not accept `role`; the separate organizer-upgrade RPC can only change the caller from attendee to organizer. Organizer updates and cancellations recheck role/ownership inside database functions; attendee notifications are inserted in the same transaction. Registration remains delegated to the atomic registration functions from migration 002.

`003_core_api.sql`, `004_engagement_and_insights.sql`, and `005_india_location_catalog.sql` are forward-only. Do not apply them remotely or automatically. Before any local verification, inspect migration status and confirm the intended local project/ports; if earlier migrations remain pending, understand that `npm exec -- supabase migration up --local` applies all pending migrations in order. Do not reset the database.

Migration 005 adds public `GET /api/locations`, `stateCode`/`cityId`/`locality` query filters to discovery and recommendations, and required structured location fields to new organizer event creation. Catalog reads are public and RLS-protected; server writes validate state/city membership and retain the existing role/ownership guards. Migration 005 has not been applied or runtime-verified here. Existing event locations are not inferred or backfilled. The city list is an initial curated catalog, not a complete Indian gazetteer.

The API implements TRD routes for saved events, notifications, feedback, attendance, organizer/admin statistics, moderation list/remove/restore, and SmartMatch. User-submitted event reporting is not implemented: the TRD does not define a report route, reporter permissions, or report-reason contract. The admin list includes all events and marks events removed through admin moderation; it is not a user-report inbox.

## Frontend integration

The App Router frontend includes public event discovery and details, sign-in/sign-up, an attendee workspace, organizer event/attendance/statistics tools, and the admin moderation workspace. Client requests use the same-origin `/api` routes and the existing JSON error format; authentication and authorization remain enforced by the server routes.

The UI does not use fabricated event data. It reports backend errors when an endpoint or required database object is unavailable. Migration `004_engagement_and_insights.sql` has not been applied or verified against the intended local database for this phase, so saved events, event-view tracking, moderation, database-backed statistics, and recommendations must not be considered runtime-verified against PostgreSQL until that migration is applied and tested separately.

Run `npm run dev` after completing the local setup above. The app requires the configured Supabase URL, public anon key, service-role key (server-only), and canonical application URL listed in `.env.example`; without the required runtime configuration, application routes that use Supabase will fail closed. The `/api/health` endpoint remains independent of Supabase configuration.

## Testing authentication and RLS

`npm run test` includes mocked auth/API unit tests. The local database integration suite is skipped unless its API URL, database URL, project ID, anon key, and service-role key are supplied. It fails closed unless project ID is `hyperlocal-events`, the API is loopback port 54321, and the database is loopback port 54322. It creates randomly named test users/events and deletes only their recorded IDs after the run.

On Windows PowerShell, provide local test credentials to the test process without printing them:

```powershell
$status = (npm exec -- supabase status --output json | Out-String) | ConvertFrom-Json
$api = [uri]$status.API_URL
$db = [uri]$status.DB_URL
if ($status.linked_project -ne 'hyperlocal-events' -or $api.Host -notin @('127.0.0.1', 'localhost', '::1') -or $api.Port -ne 54321 -or $db.Host -notin @('127.0.0.1', 'localhost', '::1') -or $db.Port -ne 54322) {
  throw 'Refusing to test against a non-local Supabase endpoint.'
}
$env:SUPABASE_TEST_PROJECT_ID = $status.linked_project
$env:SUPABASE_TEST_URL = $status.API_URL
$env:SUPABASE_TEST_DATABASE_URL = $status.DB_URL
$env:SUPABASE_TEST_ANON_KEY = $status.ANON_KEY
$env:SUPABASE_TEST_SERVICE_ROLE_KEY = $status.SERVICE_ROLE_KEY
npm run test -- tests/integration/security.local.test.ts
Remove-Item Env:SUPABASE_TEST_PROJECT_ID, Env:SUPABASE_TEST_URL, Env:SUPABASE_TEST_DATABASE_URL, Env:SUPABASE_TEST_ANON_KEY, Env:SUPABASE_TEST_SERVICE_ROLE_KEY
```

Do not paste or log `$status`, environment values, session cookies, or tokens. The integration suite creates/deletes only its own test data; it does not reset the database. Static migration tests alone are not runtime RLS evidence.

## Backend conventions

- Route handlers validate untrusted input with schemas in `lib/server/` before calling services.
- Service code should throw `AppError` for expected user-safe failures. Route handlers should map errors with `createApiErrorResponse`; unknown failures return a generic 500 response and are logged without exception details.
- Private environment values are read only from `lib/env/server.ts`, which is protected by `server-only`. Do not import it into client code.
- Database operations must use the Supabase client/query conventions in TRD.md and enforce authorization server-side and with RLS.
- Registration/cancellation integrity must be implemented atomically in PostgreSQL, not as separate application requests.
- Do not add database-specific service implementations until migrations and generated database types exist.

## Backend implementation roadmap

The PRD/TRD do not define numbered “Phase 4.” For the user-requested phase naming, **Phase 4 is an inferred proposal** based on the next incomplete item in the backend plan: the core API. This proposal covers public event reads/search, profile/preferences, organizer promotion and event management, and attendee registration/cancellation.

The Phase 4 core API proposal is implemented in Route Handlers and migration 003. It does not claim the complete P0 product: SmartMatch/recommendations, saved-event and notification inbox endpoints, feedback, organizer statistics, admin moderation, UI, and E2E flows remain later work.

Next planned backend work is deterministic SmartMatch and remaining engagement services from PRD/TRD, followed by database reconciliation and browser-flow verification.

Before each phase, re-check the applicable TRD, DATABASE, SECURITY, ARCHITECTURE, and TESTING requirements. Do not claim database readiness or deployed behavior until it has been exercised against the configured services.
