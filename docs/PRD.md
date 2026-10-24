# Product Requirements Document

## 1. Product Overview

**Product Name:** Hyperlocal Events (working title — final brand name is an open question, §12)
**One-Line Description:** A hyperlocal event discovery and community engagement platform that matches people with relevant nearby events and helps organizers reach the right audience.
**Product Type:** Community / event-discovery web platform (two-sided: attendees + organizers)
**Primary Platform:** Responsive web (desktop + mobile browsers)

## 2. Problem

**What problem are we solving?**
Event information is scattered across WhatsApp groups, social media, college websites, community pages, and event-listing websites. There is no single, location-aware place to discover what is happening nearby.

**Why does this problem matter?**
Attendees miss workshops, hackathons, networking events, cultural activities, competitions, and community gatherings simply because they never hear about them, or hear too late. Organizers, on the other side, cannot reliably reach people who are genuinely interested, struggle to manage registrations and updates, and cannot measure engagement.

**How are users solving this today?**
Word of mouth, WhatsApp/Telegram groups, Instagram pages, college notice boards and mailing lists, and generic event sites that are not location-aware or personalized. All of these require manual effort and produce mostly irrelevant results.

## 3. Goal

**Primary Goal:** Reduce the effort needed to discover relevant events nearby, and give organizers a complete tool to publish events, manage registrations, and understand engagement — in one free, end-to-end product.

**Secondary Goals:**

- Improve recommendation relevance so users see events matching their interests, location, availability, and budget first.
- Connect discovery to a full engagement loop: discover → register → get reminded → attend → give feedback → discover again.
- Demonstrate a secure, production-shaped product (real auth, real database, enforced permissions) within a 24-hour hackathon.

## 4. Target Users

### User Type 1 — Attendee

**Description:** Students, young professionals, and community members who want to find things to do nearby.
**Needs:**

- See events near them, filtered by interest, date, distance, and price.
- Trust that recommendations are relevant, and understand why an event is suggested.
- Register in a few taps and not forget about the event afterwards.

**Pain Points:**

- Events are announced in closed groups they are not part of.
- Generic listings show irrelevant or far-away events.
- No reminders, so registered events are forgotten.

### User Type 2 — Organizer

**Description:** College clubs, community groups, meetup hosts, and small event teams.
**Needs:**

- Publish an event once and reach people who actually care about that category.
- See registrations and remaining capacity in real time.
- Communicate changes (venue, time, cancellation) to registered attendees.

**Pain Points:**

- Promotion depends on spamming multiple groups with low conversion.
- Registrations are tracked manually in spreadsheets/forms.
- No visibility into views, interest, or attendance.

### User Type 3 — Administrator

**Description:** Platform moderator (hackathon scope: minimal functions only).
**Needs:**

- Review reported or suspicious listings and remove inappropriate content.
- See basic platform statistics.

**Pain Points:**

- Without moderation, spam or fake events destroy trust in the listings.

## 5. User Stories

- As an **attendee**, I want to set my interests, location, radius, and budget so that the events I see first are the ones I am most likely to attend.
- As an **attendee**, I want to see why an event was recommended to me so that I can trust the suggestions.
- As an **attendee**, I want to search and filter events by keyword, category, date, distance, and price so that I can find a specific kind of event.
- As an **attendee**, I want to view events on a map and in a list so that I can judge distance visually.
- As an **attendee**, I want to save events and register for them so that my plans are organized in one place.
- As an **attendee**, I want in-app notifications for updates and reminders so that I do not miss events I registered for.
- As an **attendee**, I want to submit feedback after attending an event so that organizers improve and my future recommendations get better.
- As an **organizer**, I want to create, edit, publish, and cancel events so that my event information is always accurate.
- As an **organizer**, I want to see registered attendees, totals, and remaining capacity so that I can plan logistics.
- As an **organizer**, I want updates and cancellations to notify registered attendees automatically (in-app) so that nobody shows up to a changed event uninformed.
- As an **admin**, I want to review and remove inappropriate events so that the platform stays trustworthy.

## 6. Core Features

### Feature 1 — Accounts, Roles & Preferences

**Purpose:** Authenticated access with attendee/organizer roles and personalization preferences.
**User Flow:** Sign up → profile created with default role (attendee) → optionally upgrade to organizer / set preferences (interests, categories, budget, location, radius) in profile settings.
**Inputs:** Email, password (Supabase Auth); preferences: interests, preferred categories, budget ceiling, preferred location (lat/lng), radius km.
**Outputs:** Session; personalized discovery defaults.
**Acceptance Criteria:**

- Users can sign up, sign in, and sign out.
- Preferences persist and drive SmartMatch and default filters.
- Role is stored server-side; it cannot be self-assigned to admin (see SECURITY.md).

**Edge Cases:** Geolocation denied → manual location selection still works. Duplicate signup → clear error message.

### Feature 2 — Event Discovery, Search & Filters

**Purpose:** Browse all published upcoming events with powerful filtering.
**User Flow:** Land on discovery page → browse feed → apply keyword/category/date/distance/price filters → open event details.
**Inputs:** Keyword, category, date range, radius + location, max price.
**Outputs:** Filtered, paginated event list (and map pins).
**Acceptance Criteria:**

- Only published, non-expired events appear.
- Filters combine correctly and results update without full page reload.
- Empty results show a helpful empty state with a next action (widen radius, clear filters).

**Edge Cases:** Events without coordinates appear in list view but not on the map or in radius filtering. Full events are labelled and cannot be registered for.

### Feature 3 — SmartMatch Recommendations (USP)

**Purpose:** A deterministic, explainable recommendation engine that ranks eligible events for the signed-in attendee.
**User Flow:** Attendee with saved preferences opens discovery → "For You" section shows ranked events with a match indicator and a reason line.
**Inputs:** User interests, preferred categories, budget, location, radius; event category, price, coordinates, start time, capacity/status.
**Outputs:** Ranked events with score (0–100) and explanation, e.g. "Recommended because this event matches your AI interest, fits your budget, and is 2.4 km away."
**Acceptance Criteria:**

- Ineligible events (cancelled, expired, full, outside radius, over budget hard limits where applicable) are filtered out before ranking.
- Score uses the documented weights: interest match 35%, proximity 25%, date/availability 20%, budget 10%, preferred category 10%.
- Every recommended event shows at least one human-readable reason.
- Scores are computed by the deterministic algorithm only — never fabricated, never labelled "AI-powered" (there is no LLM in the core path).

**Edge Cases:** New user with no preferences → fall back to popular/upcoming nearby events with a prompt to set preferences. No location → proximity component uses neutral value and explanation omits distance.

### Feature 4 — Event Details & Registration

**Purpose:** Full event information and a safe registration flow.
**User Flow:** Open event → see title, image, description, organizer, date/time, venue, distance, price, spots left → Register → confirmation → event appears in "My registrations"; capacity decremented atomically.
**Inputs:** Event id; authenticated user.
**Outputs:** Registration record (status: registered) or a clear rejection (full / deadline passed / already registered).
**Acceptance Criteria:**

- Duplicate registration for the same user + event is impossible (database unique constraint + server check).
- Capacity is enforced on the server, including under concurrent attempts.
- Registration after the deadline or for cancelled events is rejected.
- Users can cancel their own registration if permitted, freeing the seat.

**Edge Cases:** Last seat claimed by two users simultaneously → exactly one succeeds. Organizer opens their own event → registration hidden/disabled for own event.

### Feature 5 — Saved Events, Notifications & Feedback (Engagement Loop)

**Purpose:** Keep attendees engaged from discovery to return visits.
**User Flow:** Save an event from any card → view saved list → receive in-app notifications (registration confirmation, event updated/cancelled, reminder) → after the event, if attendance is confirmed, submit a 1–5 rating + comment.
**Acceptance Criteria:**

- Save/unsave is one tap and idempotent.
- Notifications are created server-side for registration, updates, and cancellations; users can mark them read.
- Feedback is limited to eligible attendees, one submission per attendee per event.

**Edge Cases:** Event cancelled after registration → all registered attendees get a notification. Feedback before the event ends → not allowed.

### Feature 6 — Organizer Event Management & Insights

**Purpose:** Let organizers run their events end to end.
**User Flow:** Organizer dashboard → Create event (title, description, category, venue, address, coordinates via map pick or geocode-free manual entry, date/time, price, capacity, image, registration deadline) → Publish → monitor registrations, remaining capacity, views → Edit / Cancel (attendees notified).
**Acceptance Criteria:**

- Organizers can manage only their own events (enforced server-side and by RLS).
- Dashboard shows real registration totals and remaining capacity; view counts shown only if genuinely collected.
- Draft events are invisible to attendees.

**Edge Cases:** Reducing capacity below current registrations → blocked with an explanation. Cancelling an event with registrations → confirmation step, attendees notified.

### Feature 7 — Admin Moderation (Minimal)

**Purpose:** Basic trust and safety.
**User Flow:** Admin opens moderation page → sees reported/suspicious events and platform stats → removes or restores listings.
**Acceptance Criteria:**

- Only admin-role users can access it (server-side check).
- Removed events disappear from discovery immediately.

## 7. Non-Goals

The following are intentionally NOT part of this version:

- Payments or ticketing checkout (events are free or pay-at-venue; price is informational/filterable).
- Email or SMS reminders (in-app notifications only; no paid messaging APIs).
- LLM/AI-generated recommendations (SmartMatch is deterministic by design).
- Native mobile apps (responsive web only).
- Social features (feeds, comments, follows, chat).
- Multi-instance scaling, Redis, microservices, or a separate backend service.
- Claiming view/engagement analytics that are not genuinely collected.

## 8. MVP Scope

**Must Have (P0 — required for the judge-ready demo):**

- App starts reliably and is deployed early; Supabase email/password authentication works.
- Profiles and preferences persist; users can become organizers through the approved self-service flow, but cannot grant themselves admin.
- Event listing, details, keyword/category/date/price filters, and useful empty/error/loading states work with real database data.
- Organizers can create, edit, publish, and cancel their own events.
- Attendees can register and cancel registrations with database-enforced capacity, deadline, status, and duplicate rules.
- SmartMatch returns deterministic, explainable rankings; when preferences/location are missing, the UI explains the fallback.
- Basic saved events and in-app notifications support the demo engagement loop. Notifications cover registration confirmation and event update/cancellation.
- Organizer dashboard shows real registrations, remaining capacity, and attendee display names (never attendee email addresses).
- Server authorization and RLS are both enabled and tested.
- Seeded demo data is clearly identifiable as demonstration data; no fabricated usage statistics.
- Production build, typecheck, lint, critical tests, and a fresh-session deployed smoke test are completed or explicitly marked not run.

**P1 (implement only after every P0 flow is stable):**

- Map view with radius filtering and manual location fallback.
- Organizer attendance marking and eligible post-event feedback.
- Saved-event polish, richer organizer charts, unread notification controls, and basic event reporting.
- Optional event image uploads via Supabase Storage if time and security validation allow; URL-only images remain the default.

**P2 (out of hackathon critical path):**

- Feedback-informed recommendation tuning; advanced analytics; full moderation queue; email/SMS reminders; natural-language search; payments; native apps. No paid or external AI service is part of the core product.

## 9. Success Metrics

**Primary Metrics:**

- Demo acceptance criteria pass end to end (see §13 and TESTING.md).
- Recommendation relevance: in the seeded demo dataset, the top-5 "For You" results for a demo persona all match that persona's interests and radius.
- Registration integrity: 0 duplicate registrations, 0 capacity overruns in concurrency testing.

**Secondary Metrics:**

- Time from landing to a relevant event detail view under 1 minute for a new user.
- Lighthouse performance score ≥ 80 on the discovery page (demo dataset).

## 10. Constraints

- **Technical:** Free and open-source / free-tier services only; no paid APIs or subscriptions. Stack fixed by the hackathon brief: Next.js + TypeScript + Tailwind + shadcn/ui, Supabase (PostgreSQL, Auth, RLS, @supabase/ssr), MapLibre GL JS with a free tile provider, Recharts, Vitest, Playwright, Vercel free tier.
- **Business:** Must be demonstrable live to judges; seeded demo data must be labelled as demonstration data, never presented as real usage.
- **Design:** The frontend must NOT look like a generic/classic template UI. It must stand out as premium, polished, and attractive — defined in DESIGN_SYSTEM.md. Core functionality takes priority over decoration.
- **Timeline:** 24 hours total, following the phase plan in the master context (foundation → frontend → backend → USP → engagement → test/deploy → polish/demo).

## 11. Assumptions

- Supabase and Vercel free tiers are sufficient for demo-scale data and traffic.
- A keyless free map style/tiles provider is available at demo time; a full list-view fallback exists if maps fail.
- Judges will use the seeded demo accounts and data for evaluation.
- Users may deny browser geolocation; manual location selection covers this.
- Event images are provided as URLs (or free stock URLs) for the MVP; uploads are optional if time permits.

## 12. Open Questions

- Final product/brand name (working title in use until decided).
- The exact official problem-statement wording must be verified against the hackathon source before submission; this PRD describes the proposed solution and must not be represented as a verbatim official statement.
- Demo city/area: choose before generating final seed coordinates; use a clearly documented default if the team does not specify one.
- Organizer role: fixed for MVP — an authenticated attendee may upgrade to organizer; admin is assigned only through a trusted server-side/database-owner operation.

## 13. Definition of Done

The product is complete when:

- [ ] Requirements in §8 (P0) are implemented
- [ ] Critical user flows work (discover → SmartMatch → event detail → register; organizer create → publish → view registration; event update/cancellation → notify registered attendees)
- [ ] Tests pass (see TESTING.md)
- [ ] Build succeeds and the app is deployed on Vercel
- [ ] Security requirements are satisfied (see SECURITY.md)
- [ ] Documentation is updated to match the implemented behavior
- [ ] The full demonstration can be completed reliably in a fresh browser session
