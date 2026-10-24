# Technical Requirements Document (TRD) — Tech Blueprint

> **Purpose:** This document removes guesswork. It fixes the exact stack, package versions, APIs, services, and tools for this project. The AI coding agent (and any developer) must build **only** with what is specified here. Anything not listed is **not approved**: do not install it, call it, or design around it without the user's explicit decision. If a requirement seems impossible with this blueprint, stop and flag it (see AGENTS.md §8) instead of substituting technology.
>
> Treat the version numbers below as target major versions, not proof that a package combination is compatible. Before implementation, verify supported Node/Next/React/TypeScript versions and peer dependencies using the installed toolchain; commit the generated `package-lock.json`. Do not use `@latest` in repeatable setup instructions after the initial scaffold.

## 1. Runtime & Platform

| Item | Requirement |
|---|---|
| Node.js | ≥ 20 LTS (development machine runs Node 24) |
| Package manager | npm only (no yarn/pnpm — one lockfile, `package-lock.json`) |
| OS targets | Development on Windows/macOS/Linux; production runtime is Vercel (Linux) |
| Browsers | Latest Chrome/Edge/Firefox/Safari; mobile Safari + Chrome Android |
| Repo layout | Single Next.js app at repo root; `docs/`, `supabase/`, `tests/` as in ARCHITECTURE.md §7 |

## 2. Fixed Technology Stack

| Concern | Technology | Version (major) | Notes |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | Server Components by default; Route Handlers for APIs |
| UI library | React | 19.x | Ships with Next.js 16 |
| Language | TypeScript | stable version compatible with selected Next.js release; strict mode required | No JavaScript files for app code |
| Styling | Tailwind CSS | 4.x | Theme tokens from DESIGN_SYSTEM.md; `@tailwindcss/postcss` |
| UI components | shadcn/ui | initialize once, then commit generated components/config | Components are copied into `components/ui/` and owned; Radix-based |
| Icons | Lucide React | compatible stable release | Only icon library allowed |
| Database | PostgreSQL via Supabase | Supabase free tier | Schema + RLS per DATABASE.md / SECURITY.md |
| DB/Auth client | `@supabase/supabase-js` | 2.x | Data + Auth APIs |
| SSR auth | `@supabase/ssr` | 0.12.x | Cookie sessions in Server Components, Route Handlers, middleware |
| Validation | zod | 4.x | One schema per input, shared between client types and server checks |
| Maps | MapLibre GL JS | 6.x | Client-only, dynamically imported |
| Charts | Recharts | 3.x | Organizer dashboard only |
| Unit/integration tests | Vitest | compatible stable release | `tests/unit`, `tests/integration` |
| E2E tests | Playwright (`@playwright/test`) | 1.x | Chromium only for the hackathon |
| Class utilities | clsx + tailwind-merge | 2.x / 3.x | The standard shadcn `cn()` helper |
| Component variants | class-variance-authority | 0.7.x | As used by shadcn/ui |

**Explicitly NOT used** (do not add): Redux/Zustand/Jotai (React + server state is enough), any ORM (Prisma/Drizzle — the Supabase client is the data layer), date libraries (use `Intl` + native `Date`), CSS-in-JS, jQuery, Bootstrap/MUI/AntD, Firebase, any paid API, any LLM API in the core product, Redis, a separate backend service.

## 3. Dependency Allowlist (package.json contract)

Install exactly these. Adding anything else requires updating this document first.

**dependencies**

```
next, react, react-dom,
@supabase/supabase-js, @supabase/ssr,
zod, maplibre-gl, recharts, lucide-react,
clsx, tailwind-merge, class-variance-authority,
+ the Radix primitives pulled in by the shadcn/ui components actually used
  (e.g. @radix-ui/react-slot, @radix-ui/react-dialog, @radix-ui/react-dropdown-menu,
   @radix-ui/react-select, @radix-ui/react-tabs, @radix-ui/react-toast,
   @radix-ui/react-avatar, @radix-ui/react-separator, @radix-ui/react-label)
```

**devDependencies**

```
typescript, @types/node, @types/react, @types/react-dom,
tailwindcss, @tailwindcss/postcss, postcss,
eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss (if used),
vitest, @vitest/coverage-v8 (optional), jsdom or happy-dom (Vitest environment, pick jsdom),
@playwright/test, supabase (CLI, for migrations + type generation)
```

**Install commands**

```bash
npx create-next-app@16 . --typescript --tailwind --eslint --app --use-npm --import-alias "@/*"  # verify the selected release and peer dependencies first
npm i @supabase/supabase-js @supabase/ssr zod maplibre-gl recharts lucide-react clsx tailwind-merge class-variance-authority
npm i -D vitest @playwright/test supabase
npx shadcn@latest init        # then: npx shadcn@latest add <component> per need
npx playwright install chromium
```

**Fonts** (no package): Google Fonts via `next/font/google` — **Bricolage Grotesque** (display) and **Manrope** (body), per DESIGN_SYSTEM.md §4.

## 4. External Services & APIs (the complete list)

| Service | Use | Cost | Key endpoints / config |
|---|---|---|---|
| **Supabase project** (one, free tier) | PostgreSQL DB, Auth, optional Storage | Free tier | Project URL + anon key + service-role key (env, §8). Auth redirect URLs must include the Vercel domain + `http://localhost:3000` |
| **Supabase Auth API** | Email/password sign-up, sign-in, session refresh | — | Via `@supabase/ssr`; no direct REST calls from app code |
| **Supabase PostgREST API** | All table reads/writes | — | Via `@supabase/supabase-js` only; RLS always on |
| **Vercel** (free tier) | Hosting the Next.js app | Free tier | Build: `next build`; output default; env vars set in dashboard |
| **OpenFreeMap** | Map style + tiles for MapLibre | Free, no key | Style URL: `https://tiles.openfreemap.org/styles/liberty`; attribution required in map control; respect provider fair-use |
| **Browser Geolocation API** | Optional user location | Free, built-in | `navigator.geolocation.getCurrentPosition`; permission-gated; manual fallback mandatory |
| **GitHub** | Source hosting only | Free | No GitHub API integration in the product |

**Explicitly no other external calls.** No geocoding API (coordinates come from a map click, preset areas, or manual lat/lng entry). No email/SMS API (notifications are in-app rows). No analytics trackers. No external image CDN dependency (event images are organizer-supplied `https:` URLs).

## 5. Internal API Specification

Base: same origin, `/api`. All endpoints require a valid Supabase session cookie **except** the two public reads. All responses are JSON. Errors use one shape everywhere:

```json
{ "error": { "code": "EVENT_FULL", "message": "This event is full." } }
```

Error codes: `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `VALIDATION` (400), `EVENT_FULL`, `DEADLINE_PASSED`, `ALREADY_REGISTERED`, `CONFLICT` (409), `INTERNAL` (500).

| Method & path | Auth | Role | Purpose / contract |
|---|---|---|---|
| `GET /api/events` | Public | any | List published, upcoming events. Query: `q`, `category`, `dateFrom`, `dateTo`, `maxPrice`, `lat`, `lng`, `radiusKm`, `page`, `pageSize` (default 12, max 48). Returns `{ events: EventListItem[], total }`. |
| `GET /api/events/[id]` | Public | any | Event detail (published only; drafts 404 for non-owners). Increments a genuine view row in `event_analytics` for signed-in viewers when that table is implemented. |
| `GET /api/recommendations` | Required | attendee | SmartMatch ranked events for the current user: `{ results: { event, score, reasons[] }[] }`. Uses saved preferences unless overridden by query params (`lat`, `lng`, `radiusKm`). |
| `POST /api/events/[id]/register` | Required | any (not own event) | Transactional registration (capacity + deadline + duplicate enforced). 201 → registration. Errors: `EVENT_FULL`, `DEADLINE_PASSED`, `ALREADY_REGISTERED`, `FORBIDDEN` for own event. |
| `DELETE /api/events/[id]/register` | Required | attendee (own) | Cancel own registration; frees capacity transactionally. |
| `POST /api/events/[id]/save` | Required | attendee | Idempotent save. `DELETE` on the same path unsaves. |
| `GET /api/me/registrations` | Required | attendee | Own registrations (upcoming + past). |
| `GET /api/me/saved` | Required | attendee | Own saved events. |
| `GET /api/me/profile` / `PATCH /api/me/profile` | Required | own | Read/update own profile + preferences (validated; role field not patchable here). |
| `POST /api/me/become-organizer` | Required | attendee | One-way self-upgrade to organizer (MVP rule, SECURITY.md §2). |
| `GET /api/notifications` | Required | own | Own notifications, newest first; `?unread=true` filter. |
| `POST /api/notifications/[id]/read` | Required | own | Mark one read. `POST /api/notifications/read-all` marks all. |
| `POST /api/events/[id]/feedback` | Required | eligible attendee | One feedback per attendee per event; only after event end + `attendance_status = attended`. Body: `{ rating: 1..5, comment? }`. |
| `POST /api/organizer/events` | Required | organizer | Create event (status starts `draft`; `publish: true` in body publishes). Returns the created event. |
| `GET /api/organizer/events` | Required | organizer | Own events, all statuses, with registration counts. |
| `PATCH /api/organizer/events/[id]` | Required | organizer (owner) | Edit own event. Capacity cannot drop below `registered_count` → `VALIDATION`. |
| `POST /api/organizer/events/[id]/cancel` | Required | organizer (owner) | Sets status `cancelled`; creates notifications for all registered attendees in the same operation. |
| `GET /api/organizer/events/[id]/attendees` | Required | organizer (owner) | Attendee display names + registration/attendance status only — never emails. |
| `PATCH /api/organizer/events/[id]/attendance` | Required | organizer (owner) | Update attendance for a registered attendee after the event; body `{ attendeeId, attendanceStatus: "attended" | "no_show" }`; attendee cannot set their own attendance. P1 unless explicitly needed for the demo. |
| `GET /api/organizer/stats` | Required | organizer | Real aggregates for own events: registrations per event, remaining capacity, total views (only if analytics rows exist). Recharts consumes this shape. |
| `GET /api/admin/events` | Required | admin | All events incl. reported/suspicious, for moderation. |
| `POST /api/admin/events/[id]/remove` | Required | admin | Remove (cancel + flag) an event; notifies organizer. |
| `GET /api/admin/stats` | Required | admin | Platform totals: users, events, registrations. |

Rules for every handler: derive the user from the session (never from the body) → validate with zod → authorize (role + ownership) → run business rules → return the standard shape. Pagination and filtering happen in SQL via the Supabase query builder, not in memory.

### Database transaction contract (required)

Registration and cancellation must be implemented in PostgreSQL, not as a sequence of independent browser/server queries. Add migrations defining `register_for_event(event_id uuid)` and `cancel_event_registration(event_id uuid)` as `SECURITY INVOKER` functions where practical, or use a carefully reviewed `SECURITY DEFINER` function with a fixed `search_path`, explicit `auth.uid()` checks, and narrowly granted execute permissions. Each operation must atomically lock/check the event, verify published status and deadline, enforce one active registration per attendee/event, update `registered_count`, mutate registration status, and return a typed outcome. Do not trust a user ID, role, price, or count supplied by the client. A cancellation of an already-cancelled/nonexistent registration must be handled idempotently without decrementing the count twice. Test concurrent requests against the actual database function.

## 6. SmartMatch Technical Specification

Location: `lib/smartmatch/` — pure TypeScript, zero imports from Next.js/Supabase/I-O. Time is an injected parameter.

```ts
scoreEvent(event: ScorableEvent, prefs: UserPreferences, now: Date): { score: number; reasons: string[] } | null
```

- Returns `null` for ineligible events (eligibility runs first): status ≠ published, `end_at < now`, `registered_count >= capacity`, distance > radius (when both coordinates exist), `registration_deadline < now`.
- Components (weights fixed; change only by updating PRD + this doc together):
  - interest match 0.35 — share of the event's category/tags present in `prefs.interests` (1.0 full, partial credit per overlap).
  - proximity 0.25 — `1 − (distanceKm / radiusKm)`, clamped [0,1]; neutral 0.5 when coordinates are unavailable.
  - date/availability 0.20 — sooner scores higher within a 14-day window, decaying to 0 at 30+ days; events the user already registered for are excluded before scoring.
  - budget 0.10 — 1.0 if `price ≤ preferred_budget` (or free), decreasing above budget; neutral 0.5 when no budget set.
  - category 0.10 — 1.0 if `event.category ∈ prefs.preferred_categories`, else 0.
- `score = round(100 × Σ weightᵢ × componentᵢ)`, clamped [0,100].
- Reasons: generated from the components that scored ≥ 0.6, using real values only (actual distance, actual category name, actual price relation). Distance uses `lib/geo/haversine.ts` (Earth radius 6371 km).
- Fully unit-tested per TESTING.md; deterministic for identical inputs.

## 7. Maps Specification

- MapLibre GL JS, dynamically imported client component (`components/events/MapView.tsx`); never SSR'd, never blocks list view.
- Style: `NEXT_PUBLIC_MAP_STYLE_URL` (default OpenFreeMap liberty, §4). Attribution control on.
- Markers: one per event with coordinates in the current result set; category-hue pin (DESIGN_SYSTEM.md §3/§13); click → popup card (title, time, distance, View button).
- User location marker only after explicit geolocation consent; "Near me" button triggers the request, page load never does.
- Failure of style/tiles → catch, render list-only with a dismissible notice (ARCHITECTURE.md §12).

## 8. Authentication Specification

- `@supabase/ssr` three-client pattern, no deviations:
  - `lib/supabase/client.ts` — browser client (`createBrowserClient`).
  - `lib/supabase/server.ts` — server client (`createServerClient` with Next.js `cookies()`).
  - `lib/supabase/admin.ts` — service-role client, `import 'server-only'`, used solely for admin operations and trusted server jobs.
  - `middleware.ts` — session refresh on matched routes (the `@supabase/ssr` pattern), no custom token handling.
- Sign-up creates the `profiles` row (database trigger on `auth.users` insert, in the migrations — not client code).
- Role reads always come from `profiles` via the server client; the client never asserts a role.

## 9. Environment Variables (complete list)

| Variable | Scope | Required | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | yes | Anon key (RLS-protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only | yes | Admin/trusted operations |
| `NEXT_PUBLIC_APP_URL` | public | yes | Canonical URL (auth redirects) |
| `NEXT_PUBLIC_MAP_STYLE_URL` | public | no (has default) | Map style URL override |

`.env.example` must list exactly these, with descriptions and no real values.

## 10. Tooling & Commands

| Tool | Use |
|---|---|
| npm | Only package manager; scripts below |
| Supabase CLI (`supabase` devDep or global) | Apply migrations to the linked project; `supabase gen types typescript` → `types/database.types.ts` |
| Vercel CLI (optional) | `vercel link`, `vercel env pull`; dashboard is equally acceptable |
| Git + GitHub | Source control; `main` stays deployable; feature branches per team member area (master context §11) |
| Playwright CLI | `npx playwright install chromium`, run E2E |

**package.json scripts (exact names):**

```
dev, build, start, lint, typecheck (tsc --noEmit),
test (vitest run), test:watch (vitest), test:e2e (playwright test),
db:types (supabase gen types …)
```

## 11. Deployment Specification

- **Vercel project:** framework preset Next.js; build command `npm run build`; install command default; Node 20+.
- **Supabase:** migrations from `supabase/migrations/` applied in order; RLS enabled on all public tables before the demo; Auth → URL configuration includes the production Vercel domain.
- **Env vars:** §9 set in the Vercel dashboard for Production (and Preview where practical); service-role key never in any `NEXT_PUBLIC_` variable.
- **Verification gate before calling it "deployed":** fresh browser session → sign up → sign in → discovery loads real DB events → register → organizer flow works (TESTING.md §5). A build that merely compiles is not a deployment.

## 12. Change Control

- Majors in §2 are frozen for the hackathon. A needed change (new package, version bump, new external service) requires: update this TRD + note it in the completion report. Silent substitutions are defects.
- If this TRD conflicts with another doc, follow AGENTS.md §8: security rules win; otherwise ask the user.
