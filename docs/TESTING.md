# Testing

## 1. Testing Goals

Prove the things the judges and the acceptance criteria actually depend on:

- SmartMatch ranks eligible events correctly and explains itself honestly.
- Registration can never exceed capacity or duplicate, even concurrently.
- Authorization and RLS actually block cross-user and cross-role access.
- The three demonstration scenarios (PRD/master context) complete reliably.

Testing claim discipline: a check is only reported as passing if it was run. Unrun tests are listed as unrun, never implied.

## 2. Test Types

### Unit Testing (Vitest)

Pure logic, heavily covered:

- `lib/smartmatch/score.ts` — each scoring component (interest, proximity, date/availability, budget, category) in isolation and combined; weight application; score bounds (0–100); deterministic output.
- `lib/smartmatch/eligibility.ts` — cancelled, expired, full, out-of-radius, and draft events are excluded; boundary values (event exactly at radius, exactly at budget).
- `lib/smartmatch/explain.ts` — every scored event yields ≥1 truthful reason; reasons never claim facts that are false (e.g. no distance reason when coordinates are missing).
- `lib/geo/haversine.ts` — known city-pair distances within tolerance; same point = 0; antipodal sanity.
- `lib/validation/schemas.ts` — valid/invalid payloads for event create/edit, profile preferences, feedback (rating bounds, length limits).

### Integration Testing (Vitest + Supabase test project or local)

- Route handlers: register (success, duplicate → `ALREADY_REGISTERED`, full → `EVENT_FULL`, past deadline, cancelled event), save/unsave idempotence, event create/edit authorization, feedback eligibility.
- RLS policies, exercised with real anon/user/service clients:
  - Attendee A cannot read/modify Attendee B's registrations, saved events, notifications, or profile.
  - Organizer A cannot edit Organizer B's event (API *and* direct table access). Attendees cannot mark themselves attended; only the owning organizer/admin can update attendance for an eligible event.
  - Non-admin cannot set `role = 'admin'` by any path.
  - Anon can read published events only — never drafts.
- Concurrency: parallel registration attempts for the final seat → exactly one success, remaining attempts return `EVENT_FULL`, and `registered_count` equals the number of active registrations. Also test concurrent cancellation/re-registration and ensure no double decrement/increment.

### End-to-End Testing (Playwright)

The configured `npm run test:e2e` suite starts a dedicated local Next.js server and uses mocked same-origin API responses. It currently checks:

- Public event discovery renders API event data and switches between list and map fallback when event coordinates are missing.
- MapLibre initializes a map and event marker against a mocked style JSON; external tile-provider availability is not tested.
- Discovery API failure is shown and can recover after retry.
- Authentication API errors are rendered as user-safe messages.

These browser tests do not verify live authentication, Supabase RLS, registration/capacity transactions, or external map tile availability. The following real-service flows remain required against an isolated local Supabase database before production:

1. Attendee discovery: sign in → set interests/radius/budget → recommendations appear with explanations → open event → register → event visible in My registrations.
2. Organizer: sign in as organizer → create + publish event → dashboard shows it → registration count updates after Scenario 1's registration.
3. Engagement: organizer cancels/updates an event → attendee sees an in-app notification → after a completed event with confirmed attendance, attendee submits feedback.

Plus two negative flows: geolocation denied → manual location path still works; registering twice → blocked with a clear message.

## 3. Testing Tools

- **Unit/Integration:** Vitest.
- **E2E:** Playwright (Chromium).
- **Manual:** the demo script rehearsal in a fresh browser profile (part of the definition of done, not a substitute for automated checks).

## 4. Test File Structure

```
tests/
  unit/
    smartmatch.score.test.ts
    smartmatch.eligibility.test.ts
    smartmatch.explain.test.ts
    geo.haversine.test.ts
    validation.schemas.test.ts
  integration/
    registrations.test.ts
    rls.policies.test.ts
    organizer-authz.test.ts
  e2e/
    attendee-discovery.spec.ts
    organizer-flow.spec.ts
    engagement-loop.spec.ts
```

## 5. Critical User Flows (acceptance checklist form)

**Flow: Register for an event**
1. Sign in as the demo attendee. 2. Open a published event with seats left. 3. Click Register.
**Expected result:** Confirmation state shown; registration row exists; `registered_count` incremented by exactly 1; a confirmation notification exists; a second attempt is rejected as duplicate.

**Flow: Organizer manages only own events**
1. Sign in as Organizer A. 2. Attempt to open the edit page / call the update API for Organizer B's event.
**Expected result:** 403/redirect with a clear message; the event is unchanged in the database.

**Flow: SmartMatch relevance**
1. Sign in as the demo attendee (interests: Technology, Music; radius 10 km; budget set). 2. Open discovery.
**Expected result:** Top "For You" results are within radius, match interests/categories, show score + at least one true reason; the seeded full/cancelled/draft events never appear.

**Flow: Capacity under concurrency**
1. Seed an event with 1 seat left. 2. Fire 5 simultaneous registration requests from different users.
**Expected result:** Exactly 1 success; 4 receive `EVENT_FULL`; `registered_count` = capacity.

## 6. Coverage

- **Target:** ~100% of `lib/smartmatch` and `lib/geo` (pure logic, cheap to cover, highest demo risk); all registration/authorization paths in integration.
- **Prioritize:** critical business logic > authorization > data mutations > critical journeys. No vanity coverage targets for presentational components.
- UI components are covered by E2E + manual demo rehearsal rather than snapshot tests.

## 7. Commands

```
npm run test            # Vitest (unit + integration)
npm run test:e2e        # Playwright
npm run lint            # ESLint
npm run typecheck       # tsc --noEmit
npm run build           # production build
```

## 8. Definition of Done

- [ ] Unit tests pass (SmartMatch, geo, validation)
- [ ] Integration tests pass (registrations, RLS, organizer authorization, concurrency)
- [ ] E2E critical flows pass (or any unrun E2E is explicitly recorded as unrun)
- [ ] Lint passes with zero warnings
- [ ] Type checking passes
- [ ] Build passes
- [ ] Demo scenarios verified manually in a fresh browser session against the deployed app
- [ ] No blocking errors on any P0 flow (PRD §8)
