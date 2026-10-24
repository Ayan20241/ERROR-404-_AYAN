# Architecture

## 1. System Overview

A single Next.js application (modular monolith) serves the UI and all HTTP APIs. Supabase provides PostgreSQL, authentication, and (optionally) file storage. The SmartMatch recommendation engine is a pure, deterministic TypeScript module inside the app — no external AI service. Maps use MapLibre GL JS with a free, keyless tile/style provider, with list view as a full fallback. The app deploys to Vercel free tier; the database and auth run on Supabase free tier.

## 2. Architecture Pattern

**Pattern:** Modular monolith (one Next.js app; modules = feature folders under `lib/` and route groups under `app/`).
**Reason:** A 24-hour hackathon with a small team. One deployable, shared types end to end, no network boundaries to debug. Modules keep boundaries clean enough to split later if ever needed. Explicitly rejected: microservices, a separate Python/Node backend, Redis, vector DBs — no demonstrated requirement justifies them.

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) + React + TypeScript, Tailwind CSS, shadcn/ui, Lucide React |
| Backend | Next.js Route Handlers (server-side), server components where suitable |
| Database | Supabase PostgreSQL (PostGIS optional; Haversine in app code by default) |
| Authentication | Supabase Auth via `@supabase/ssr` (cookie-based sessions) |
| Storage | Event images by URL for MVP; Supabase Storage free tier only if uploads are implemented |
| Maps | MapLibre GL JS + keyless free style (e.g. OpenFreeMap) with attribution; list fallback |
| Charts | Recharts (organizer dashboard) |
| Testing | Vitest (unit/integration), Playwright (E2E, time permitting) |
| Hosting | Vercel free tier (app), Supabase free tier (DB/auth) |
| Payments / Email | None (in-app notifications only) |

## 4. System Components

### Frontend responsibilities

- Render discovery, event detail, dashboards, and forms per DESIGN_SYSTEM.md.
- Collect input and perform *client-side* validation for UX only (never trusted).
- Browser geolocation opt-in; manual location fallback.
- Map rendering and pin interactions (MapLibre), list/map toggle.

### Backend responsibilities (Next.js server)

- All authorization decisions (role + ownership) and business rules.
- Server-side validation of every input (zod schemas shared with client types).
- SmartMatch scoring endpoint/logic and recommendation explanations.
- Capacity-safe registration (single transaction / atomic conditional update).
- Notification creation on registration, event update, cancellation.
- Organizer statistics computed from real rows only.

### Database responsibilities

- System of record for profiles, events, registrations, saved events, notifications, feedback, analytics.
- Row Level Security as a second, independent enforcement layer (SECURITY.md).
- Unique constraints that make duplicate registrations/saves/feedback impossible at the data layer.

## 5. Architecture Diagram

```
Attendee / Organizer / Admin (browser)
            │  HTTPS
            ▼
┌──────────────────────────────────────────────┐
│ Next.js app (Vercel)                         │
│  app/ pages (RSC + client components)        │
│  app/api/* Route Handlers                    │
│    ├─ lib/supabase (browser/server clients)  │
│    ├─ lib/smartmatch (pure TS scoring)       │
│    ├─ lib/geo (Haversine, radius filters)    │
│    ├─ lib/validation (zod schemas)           │
│    └─ lib/notifications                    │
└───────────────┬──────────────────────────────┘
                │  Postgres + Auth API (TLS)
                ▼
┌──────────────────────────────────────────────┐
│ Supabase (free tier)                         │
│  PostgreSQL + RLS · Auth · (Storage opt.)    │
└──────────────────────────────────────────────┘
Browser ── MapLibre GL ──▶ free tile/style CDN (attribution required)
```

## 6. Data Flow

### Register for an event

1. User clicks Register on an event page.
2. Client calls `POST /api/events/:id/register` with the session cookie.
3. Handler authenticates the session (Supabase server client).
4. Server loads the event; rejects if not published, past deadline, or cancelled.
5. Call the database registration function. In one transaction it locks/checks the event, validates status/deadline/capacity, prevents duplicate active registrations, writes the registration, increments the count, and creates the confirmation notification.
6. The database transaction inserts the confirmation notification, so registration cannot succeed without its required notification record.
7. Response returns the registration; UI updates to "Registered" and spots-left refreshes.

### SmartMatch recommendations

1. Client requests `GET /api/recommendations` (or the discovery server component calls the same service function).
2. Server loads the user's preferences and candidate events (published, upcoming).
3. Eligibility filter removes cancelled/expired/full/out-of-radius events.
4. `lib/smartmatch` scores each candidate (weights in PRD §6 Feature 3) and builds reason strings.
5. Ranked list returned with score + reasons; UI renders match pills and explanation lines.

### Create / cancel an event (organizer)

1. Organizer submits the event form → `POST /api/organizer/events`.
2. Server validates role = organizer and the payload schema; inserts with `organizer_id = session user`.
3. On cancel: status → `cancelled`; server creates notifications for all registered attendees in the same request.

## 7. Project Structure

```
app/
  (public)/            landing + discovery, events/[id]
  (auth)/              login, signup
  (attendee)/         profile, saved, my-registrations, notifications
  (organizer)/        dashboard, events/new, events/[id]/edit, events/[id]/attendees
  (admin)/            moderation
  api/                 route handlers mirroring the features above
components/
  ui/                  shadcn/ui primitives (locally owned)
  events/              EventCard, EventGrid, FilterBar, MapView, MatchPill…
  layout/              Header, BottomNav, Footer
lib/
  supabase/            client.ts (browser), server.ts (@supabase/ssr), admin.ts (server-only)
  smartmatch/          score.ts, eligibility.ts, explain.ts, types.ts
  geo/                 haversine.ts
  validation/          schemas.ts (zod)
  notifications/       create.ts
  auth/                roles.ts, guards.ts
types/                 database.types.ts (generated from Supabase), domain.ts
supabase/
  migrations/          numbered SQL migrations (schema + RLS + seed separation)
tests/
  unit/  integration/  e2e/
docs/                  this documentation set
```

## 8. Dependency Rules

- UI components never access the database or Supabase directly; they call API routes or receive server-fetched props.
- `lib/smartmatch` and `lib/geo` are pure TypeScript: no Next.js, no Supabase, no I/O — fully unit-testable.
- Route handlers own authorization + validation; service functions in `lib/` assume inputs already validated.
- The Supabase service-role client (`lib/supabase/admin.ts`) is imported only by server code paths that genuinely need it, and is never bundled to the browser (`server-only` import guard).
- Client code may only use `NEXT_PUBLIC_*` environment variables.

## 9. Key Technical Decisions

**Decision:** Deterministic SmartMatch engine instead of an LLM.
**Context:** No paid AI allowed; recommendations must be explainable to judges.
**Alternatives:** LLM-generated rankings; "AI-powered" labelling of a heuristic.
**Reason:** Deterministic scoring is free, fast, testable, and honestly explainable. We never claim AI where none exists.

**Decision:** Haversine distance in app code; PostGIS optional.
**Context:** Need radius filtering on free-tier Supabase.
**Alternatives:** PostGIS `ST_DWithin` (powerful, extra setup + extension dependency).
**Reason:** Candidate sets are demo-scale; Haversine + a bounding-box prefilter is simple and portable. If PostGIS is already enabled, it may replace the filter without changing the API.

**Decision:** In-app notifications only (no email/SMS).
**Context:** No paid messaging APIs; free email tiers add verification friction.
**Alternatives:** Resend/SMTP free tiers.
**Reason:** The engagement loop works fully in-app; email is a P2 enhancement.

**Decision:** Next.js Route Handlers instead of a separate backend.
**Context:** One repo, one deploy, shared types; Vercel free tier.
**Alternatives:** Separate Express/FastAPI service.
**Reason:** Less infra, fewer failure modes, same security model via server-side checks + RLS.

**Decision:** Defense in depth — server authorization AND Postgres RLS.
**Context:** Supabase APIs are directly reachable with the anon key; client-side checks are cosmetic.
**Reason:** Either layer alone has failure modes; together they satisfy the brief's security requirements.

## 10. Performance Considerations

- Discovery queries filter in SQL (status, start time, category) and cap page size; scoring runs on the filtered candidate set, not the whole table.
- Images: remote URLs with `next/image` optimization and lazy loading below the fold.
- Map loads lazily (dynamic import, client-only) so it never blocks the list view or SSR.
- Skeleton loaders for feed and detail pages; optimistic UI only for save/unsave (safe, reversible), never for registration.

## 11. Scalability Considerations

- Stateless app tier on Vercel scales horizontally by default; all state is in Supabase.
- The scoring module is pure and cacheable per (user preferences, event set) if traffic ever demands it.
- Known ceiling: free-tier Supabase connections/rows — acceptable for hackathon scale; documented, not hidden.

## 12. Failure Scenarios

- **Database unavailable:** API returns a typed 503 error; UI shows an error state with retry. No page renders fabricated data.
- **Map tiles/style fail to load:** MapView catches the error and the split view collapses to list-only with a notice; all functionality remains.
- **Geolocation denied/unavailable:** Manual location picker (text + map click or preset areas) is offered; radius features degrade to city-level defaults.
- **Authentication fails/expired:** Protected routes redirect to login with a return URL; API returns 401 with a typed error.
- **Registration race for the last seat:** The transactional check + unique constraint guarantee exactly one winner; the loser receives a clear "Event is full" response.
- **Event cancelled while a user is viewing it:** Detail page revalidates on action; registration attempts are rejected server-side regardless of what the client shows.
