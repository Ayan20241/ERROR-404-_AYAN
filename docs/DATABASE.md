# Database

## 1. Database Engine

**Database:** PostgreSQL (Supabase free tier)
**Access:** Supabase client libraries; `@supabase/ssr` for session-aware server access; service-role client server-side only (see SECURITY.md).
**Geography:** Coordinates stored as `double precision` lat/lng; distance computed with Haversine in app code. PostGIS is optional and not required (see ARCHITECTURE.md §9).

## 2. Naming Conventions

- **Tables:** `snake_case`, plural (`events`, `registrations`).
- **Columns:** `snake_case` (`organizer_id`, `start_at`).
- **Primary Keys:** `id uuid primary key default gen_random_uuid()` on every table.
- **Foreign Keys:** `<referenced_table_singular>_id` (e.g. `event_id`, `attendee_id`, `organizer_id`), always `references <table>(id)`.
- **Timestamps:** `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()` (maintained by trigger or app update). All times stored in UTC; the UI converts to the user's timezone.
- **Enums:** PostgreSQL enums (or check constraints) for status fields — one mechanism, used consistently: enums `user_role`, `event_status`, `registration_status`, `attendance_status`.

## 3. Tables

### profiles

**Purpose:** One row per authenticated user; preferences drive SmartMatch and defaults.
**Columns:**

- `id uuid PK references auth.users(id) on delete cascade`
- `display_name text`
- `role user_role not null default 'attendee'` (`attendee | organizer | admin`)
- `interests text[] not null default '{}'` (category/interest tags)
- `preferred_categories text[] not null default '{}'`
- `preferred_budget numeric(10,2)` (max price the user is comfortable with; null = no preference)
- `preferred_location_label text`
- `preferred_latitude double precision`, `preferred_longitude double precision`
- `preferred_radius_km numeric not null default 10`
- `created_at`, `updated_at`

### events

**Purpose:** A single event listing owned by one organizer.
**Columns:**

- `id uuid PK`
- `organizer_id uuid not null references profiles(id)`
- `title text not null`
- `slug text` (optional, for readable URLs)
- `description text not null`
- `category text not null` (one of the fixed category list in §5)
- `country_code text` (currently nullable for legacy ambiguity; new events use `IN`)
- `city_id text` (nullable FK to the India city catalog; identifies its state/UT through the catalog)
- `locality text` (optional area name, max 120 characters)
- `venue_name text`, `address text`
- `latitude double precision`, `longitude double precision` (nullable — events without coordinates are list-only)
- `start_at timestamptz not null`, `end_at timestamptz not null`
- `price numeric(10,2) not null default 0`, `currency text not null default 'INR'`
- `capacity int not null`
- `registered_count int not null default 0` (maintained transactionally with registrations; source of truth for spots-left)
- `registration_deadline timestamptz`
- `image_url text`
- `status event_status not null default 'draft'` (`draft | published | cancelled | completed`)
- `created_at`, `updated_at`

### registrations

**Purpose:** An attendee's registration for an event.
**Columns:**

- `id uuid PK`
- `event_id uuid not null references events(id) on delete cascade`
- `attendee_id uuid not null references profiles(id) on delete cascade`
- `status registration_status not null default 'registered'` (`registered | cancelled`)
- `attendance_status attendance_status not null default 'unknown'` (`unknown | attended | no_show`)
- `registered_at timestamptz not null default now()`
- `created_at`, `updated_at`

### saved_events

**Purpose:** Bookmarks.
**Columns:** `id uuid PK`, `attendee_id uuid not null references profiles(id)`, `event_id uuid not null references events(id)`, `created_at`.

### notifications

**Purpose:** In-app notifications (registration confirmations, event updates/cancellations, reminders).
**Columns:**

- `id uuid PK`
- `recipient_id uuid not null references profiles(id) on delete cascade`
- `event_id uuid references events(id) on delete set null`
- `type text not null` (`registration_confirmed | event_updated | event_cancelled | reminder | general`)
- `title text not null`, `message text not null`
- `read_at timestamptz` (null = unread)
- `created_at`

### event_feedback

**Purpose:** Post-event ratings/comments from eligible attendees.
**Columns:**

- `id uuid PK`
- `event_id uuid not null references events(id) on delete cascade`
- `attendee_id uuid not null references profiles(id) on delete cascade`
- `rating int not null` (1–5)
- `comment text`
- `created_at`

### event_analytics

**Purpose:** Genuine signed-in event-detail views for organizer insights.
**Columns:** `id uuid PK`, `event_id uuid not null references events(id)`, `viewer_id uuid not null references profiles(id)`, `viewed_on date`, `viewed_at timestamptz not null default now()`. Migration 004 deduplicates each attendee/event/UTC day; anonymous and organizer self-views are not counted.

### event_moderation

**Purpose:** Preserve the prior event status while an administrator removes an event, allowing a safe restore.
**Columns:** `event_id uuid PK references events(id)`, `previous_status event_status`, `moderated_by uuid references profiles(id)`, `flagged_at timestamptz`. The table has RLS enabled and no direct client grants; only guarded administrator database functions read or mutate it.

## 4. Relationships

- `profiles` → `events`: one organizer has many events (`events.organizer_id`).
- `profiles` → `registrations`: one attendee has many registrations.
- `events` → `registrations`: one event has many registrations.
- `profiles` ↔ `events` via `saved_events`: many-to-many bookmarks.
- `profiles` → `notifications`: one recipient has many notifications.
- `events` + `profiles` → `event_feedback`: one feedback per attendee per event.
- `events` → `event_analytics`: one event has many deduplicated signed-in view records.

## 5. Constraints

- **Categories (fixed list):** `Technology`, `Music`, `Food & Drink`, `Sports & Fitness`, `Arts & Culture`, `Business & Networking`, `Education & Workshops`, `Community`, `Health & Wellness`, `Other`. Enforced by check constraint on `events.category` and mirrored in app types.
- **Unique:** `saved_events (attendee_id, event_id)`; `event_feedback (attendee_id, event_id)`; `profiles.id` = the auth user id. For registrations, retain history while permitting a user to cancel and later re-register: create a **partial unique index** on `(attendee_id, event_id) WHERE status = 'registered'`. Do not add a full unique constraint on `(attendee_id, event_id)`.
- **Checks:** `events.capacity > 0`; `events.price >= 0`; `events.end_at > events.start_at`; `events.registered_count >= 0 and registered_count <= capacity`; `event_feedback.rating between 1 and 5`; latitude/longitude ranges when present.
- **Foreign keys:** as defined per table; organizer deletion must not orphan events (`organizer_id` has no cascade — handle account deletion deliberately).
- **India locations:** `india_admin_divisions` stores state and Union Territory rows separately. `india_cities` references one division and has a state-scoped unique city name plus a stable state-prefixed city ID. Event `(country_code, city_id)` references the catalog, so an event cannot pair a city with another division. Venue/address remain event fields; locality is an optional event-provided label, not a guessed geocode.
- **Capacity integrity:** active registration insert/cancel and `registered_count` increment/decrement happen atomically in a database transaction/function. A check constraint prevents `registered_count > capacity`; the function locks the event row (or uses an equivalent atomic conditional update) so concurrent requests cannot oversell. `registered_count` must equal the count of active registrations; add a reconciliation test/script for development.

### Required database functions

Implement and grant only the minimum required execute permissions for:

- `register_for_event(p_event_id uuid)`: derive the attendee from `auth.uid()`, require an authenticated attendee, reject self-registration by the event organizer, require `published` status and an unexpired registration deadline, reject an existing active registration, enforce capacity atomically, insert/reactivate a registration, increment the count once, and create a confirmation notification. Return a predictable outcome that the API maps to the standard error codes.
- `cancel_event_registration(p_event_id uuid)`: derive the attendee from `auth.uid()`, cancel only their active registration, decrement once, and return an idempotent result if already cancelled.
- `mark_event_attendance(p_event_id uuid, p_attendee_id uuid, p_attendance attendance_status)`: callable only by the owning organizer or admin; only for a registered attendee and an event that has ended (or according to an explicitly documented event-day rule). Never allow attendees to mark themselves attended.

Functions must set a safe `search_path` if `SECURITY DEFINER` is required, fully qualify referenced objects, revoke default public execution, and be covered by authorization/concurrency tests. Prefer `SECURITY INVOKER` when RLS permits the operation.

## 6. Indexes

| Index                                                     | Reason                                   |
| --------------------------------------------------------- | ---------------------------------------- |
| `events (status, start_at)`                               | Discovery feed: published + upcoming     |
| `events (category)`                                       | Category filtering                       |
| `events (organizer_id)`                                   | Organizer dashboard queries              |
| `events (latitude, longitude)`                            | Bounding-box prefilter for radius search |
| `registrations (event_id)`, `registrations (attendee_id)` | Attendee lists + "my registrations"      |
| `saved_events (attendee_id)`                              | Saved list                               |
| `notifications (recipient_id, read_at)`                   | Unread counts + inbox                    |
| `event_feedback (event_id)`                               | Per-event feedback                       |

## 7. Data Validation

- All writes pass zod schemas server-side (ARCHITECTURE.md §8) before reaching the database; DB checks are the backstop, not the primary validator.
- Prices, capacities, roles, and statuses are never accepted from the client as trusted values — role comes from `profiles`, counts from the database.
- Free-text fields have max lengths enforced in schema (title 140, description 5000, comment 1000).

## 8. Soft Delete

- **Events:** no row deletion by organizers; cancellation is `status = 'cancelled'` (attendees and history remain valid). Admin removal sets status to `cancelled` with an admin note path, or deletes only for abuse cases.
- **Registrations:** cancellation is a status change, preserving history and freeing capacity transactionally.
- **Profiles:** account deletion is an explicit server-side workflow. MVP policy: do not delete an organizer profile while it owns non-deleted events; require transfer/cancellation and confirmation first. For attendee deletion, delete/anonymize personal profile data and cascade that user’s registrations, saved events, notifications, and feedback according to foreign-key policy. Document any retention required for event integrity; never leave orphaned organizer references.

## 9. Auditing

- `created_at` / `updated_at` on all mutable tables.
- Event status changes and registration status changes are reconstructible from row history fields (`status`, `registered_at`, `read_at`); a dedicated audit table is out of MVP scope.
- Notifications double as the user-facing record of consequential changes (update/cancel).

## 10. Sensitive Data

- **Location:** precise preferred coordinates live only in the user's own profile (RLS: owner-only). The UI should describe location use honestly; never expose one user's coordinates to another user.
- **Emails:** live in `auth.users`, not duplicated into `profiles`.
- **Attendee lists:** visible only to the owning organizer and admins; expose display names only, never emails, to organizers.
- **Secrets:** none are stored in these tables, ever.

## 11. Migration Rules

1. Every schema change is a numbered SQL file in `supabase/migrations/` (`001_init.sql`, `002_rls.sql`, …), including all RLS policies — no console-only state.
2. Migrations are applied in order to a fresh Supabase project to prove reproducibility.
3. Migrations are tested locally/against a scratch project before the demo project.
4. Seed data is a separate script (`supabase/seed.sql`), never mixed into schema migrations.
5. Destructive changes (drops) require an explicit note in the migration header.

## 12. Seed Data

For demo and testing (labelled as demonstration data in the UI where relevant):

- Demo accounts: one attendee (with interests: Technology, Music; radius 10 km; budget set), one organizer, one admin.
- ~12 events across at least 6 categories, varied prices (free + paid), varied distances around the demo city's center, start times spread over the next 14 days; include edge cases: one full event, one almost-full, one cancelled (hidden from discovery), one draft (organizer-only), one past event with feedback.
- A few registrations and one feedback entry so dashboards and the engagement loop demo with real rows — presented as seeded demo content, never as real user statistics.

## 13. Initial migration implementation status

The database foundation is represented by ordered migrations:

- `supabase/migrations/001_core_schema.sql` creates the four enums and the six core tables above, their documented checks and indexes, `updated_at` triggers, and a profile-creation trigger for new Supabase Auth users.
- `supabase/migrations/002_rls_and_integrity.sql` enables RLS, applies column-scoped grants and owner/organizer policies, exposes an organizer attendee view with display names only, and defines the registration, cancellation, and attendance functions.
- `supabase/migrations/003_core_api.sql` adds the invoker-rights, SQL-paginated public event search function; an authenticated attendee-to-organizer-only promotion function; and owner/admin-checked event update/cancellation functions. Event updates/cancellations and attendee notifications are atomic. Event update locks the row and checks active registrations before reducing capacity.
- `supabase/migrations/004_engagement_and_insights.sql` adds deduplicated signed-in event views, private moderation state, idempotent attendee saves, owner-scoped organizer aggregates, admin-only platform aggregates and moderation listing/removal/restore functions.
- `supabase/migrations/005_india_location_catalog.sql` seeds all 28 states and 8 Union Territories separately, with an initial curated set of urban city choices; adds nullable event location references, public read-only catalog RLS, a location-aware SQL search function, and location support to the existing owner-checked event update function. It deliberately does not backfill legacy event locations.

The current city catalog is an initial selectable set of major/administrative urban centres, not a complete list of every Indian municipality, town, or locality. Extend it through reviewed forward-only catalog migrations as coverage is needed. Do not add cities as free-text event locations or infer state/city from legacy addresses.

For legacy events, `country_code`, `city_id`, and `locality` remain `NULL`; existing venue, address, and coordinates are preserved. Do not assign `IN` or a city based only on text or coordinates. New organizer event creation requires an Indian state/UT, catalog city, venue, and address. To publish a legacy event, its owner must explicitly provide a valid state/UT, city, venue, and address.

The anonymous event-read policy checks only `events.status = 'published'`; it does not query tables unavailable to `anon`. Authenticated event reads additionally allow an organizer to read their own events, an attendee to read events they registered for, and an admin to read events. Profiles remain owner-readable through the client policy.

`register_for_event` only accepts an authenticated profile whose role is `attendee`. It locks the event row, rejects the organizer, unavailable events, passed deadlines, duplicate active registrations, and full events; inserts a new registration row (preserving cancelled rows as history), updates the count, and inserts a confirmation notification in the same transaction. `cancel_event_registration` is idempotent for already-cancelled registrations and preserves history while decrementing capacity exactly once. `mark_event_attendance` is restricted to the event organizer or an admin, requires an ended event and active registration, and accepts only `attended` or `no_show`.

Security-definer functions use a restricted `pg_catalog, pg_temp` search path and fully qualified application/auth references. Public execution is revoked; user/admin functions are granted to `authenticated` and enforce the caller's role internally. Event-view insertion is granted only to `service_role` and is called from the server after session verification. These static definitions do not substitute for PostgreSQL execution, RLS-role testing, authorization testing, concurrent-registration testing, or a registered-count reconciliation test.

The local Supabase config currently targets PostgreSQL major version 17 and disables automatic seed loading. Confirm that this matches the target Supabase project before applying migrations. No `seed.sql` is included: the demo city and real demo Auth accounts have not been provided, and fabricated accounts or credentials must not be created.

Migration 003 is forward-only; do not edit migrations 001/002 that may already have been applied. Apply it only to the intended local project after confirming the CLI status, using `npm exec -- supabase migration up --local`; never link it to a shared/demo/production project. Static migration-contract tests are not evidence that the new SQL has been applied or runtime-verified. Generated TypeScript database types remain deferred.
