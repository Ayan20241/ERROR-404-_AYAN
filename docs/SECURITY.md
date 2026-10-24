# Security Guidelines

> Security is a mandatory requirement of this project, not a stretch goal. Every rule here is testable — see TESTING.md for the authorization test matrix.

## 1. Authentication

**Provider:** Supabase Auth.
**Methods:**

- Email + password (MVP).
- Sessions handled with `@supabase/ssr`: httpOnly cookie-based sessions, refreshed in Next.js middleware.
- No custom password storage, ever. Password rules are Supabase's; the UI communicates them honestly.

## 2. Authorization

**Roles:** `attendee`, `organizer`, `admin` — stored in `profiles.role`, read server-side from the database on every privileged request.

**Permission matrix:**

| Action | Attendee | Organizer | Admin |
|---|---|---|---|
| Browse/search published events | ✓ | ✓ | ✓ |
| Save events, register, cancel own registration | ✓ (own) | ✓ (own) | ✓ |
| Submit feedback | ✓ (eligible events only) | ✓ (eligible only) | ✓ |
| Create/edit/publish/cancel events | ✗ | ✓ (own events only) | ✓ |
| View attendee list of an event | ✗ | ✓ (own events only) | ✓ |
| Update own profile/preferences | ✓ (own) | ✓ (own) | ✓ |
| Change any role | ✗ | ✗ | ✓ (server-side only) |
| Moderate/remove any event, view platform stats | ✗ | ✗ | ✓ |

**Rules:**

- Authorization is enforced **server-side** in every route handler AND by Postgres RLS. Client-side hiding is UX only.
- Admin role can never be granted through any client-editable field or self-service endpoint. It is assigned only via a server-side operation using the service-role key (e.g. a one-off SQL update by the project owner).
- Organizer self-upgrade (attendee → organizer from profile) is allowed for the MVP; it grants event creation for *own* events only and nothing else. The endpoint must ignore/reject any requested role value and update only `attendee` to `organizer`; it must never accept `admin` or modify another user.
- Ownership checks compare the resource's owner id to the session user id on every mutation — no insecure direct object references (IDOR).

## 3. Secrets

- Never hard-code credentials; never commit `.env` files (`.env*` is gitignored except `.env.example`).
- Never expose private secrets to the client: the service-role key and any non-`NEXT_PUBLIC_` variable must never appear in client components, browser bundles, logs, or error messages.
- Use environment variables for all configuration; document every variable in `.env.example` with a description and no real values.
- Rotate any credential that is ever pasted into chat, a screenshot, or a commit.
- The service-role client lives in one server-only module with a `server-only` import guard.

## 4. Environment Variables

**Public (browser-safe, `NEXT_PUBLIC_`):**

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon key (safe only because RLS is enabled and verified).
- `NEXT_PUBLIC_APP_URL` — canonical app URL for redirects.
- `NEXT_PUBLIC_MAP_STYLE_URL` — free map style URL (no key).

**Private (server-only):**

- `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS; used only for admin operations and trusted server jobs.
- (No other private keys are required for the MVP — there are no paid APIs.)

## 5. API Security

- **Input validation:** every route handler validates params/body with zod schemas (shared with DATABASE.md limits). Unknown fields are stripped; invalid input returns 400 with field-safe messages.
- **Authentication:** handlers derive the user from the session cookie via the Supabase server client; the request body never supplies a user id.
- **Authorization:** role + ownership checks run before any mutation (see §2).
- **Business-rule enforcement in the database:** capacity, registration deadline, event status, duplicate active registration, registration count, cancellation count, and notification creation for registration/cancellation are enforced in one database transaction/function. Server-side checks improve UX but are not the integrity boundary.
- **Rate limiting:** rely on Vercel/Supabase platform limits for the MVP; auth endpoints keep Supabase's built-in rate limits enabled. Revisit before any public launch.
- **CORS:** same-origin app; no wildcard CORS on API routes.
- **Error responses:** typed shape `{ error: { code, message } }`; messages never include stack traces, SQL, table names beyond what's needed, or other users' data.
- **Injection/XSS:** parameterized queries via the Supabase client only (no string-built SQL); React's default escaping for all rendered user content; no `dangerouslySetInnerHTML` with user data.
- **CSRF:** use same-site cookie settings and validate same-origin `Origin`/`Host` for state-changing requests where applicable; do not rely on HTTP method alone. Never mutate state through GET. Use framework protections and avoid wildcard CORS.

## 6. Data Protection

- **RLS policies (summary — the migrations are the source of truth):**
  - `profiles`: a user can select/update only their own row; role column changes are blocked at the policy level for non-admins (role updates go through a server endpoint).
  - `events`: anyone (including anon) can select `published` events; organizers can select/insert/update only rows where `organizer_id = auth.uid()`; admins unrestricted via service role.
  - `registrations`: attendees select/insert/update only their own; the owning organizer can select registrations for their events (display name only via a view that excludes email); no one can update another user's registration.
  - `saved_events`, `notifications`, `event_feedback`: strictly owner-scoped (`recipient_id`/`attendee_id = auth.uid()`); feedback insert additionally requires an eligible registration (checked server-side and by policy where feasible).
  - `event_analytics`: insert-only for authenticated users; selects restricted to the event's organizer/admin.
- **Location privacy:** a user's preferred coordinates are visible only to that user. Distances shown publicly are event-to-viewer, computed for the viewer only.
- **Retention/deletion:** follow the explicit account-deletion policy in DATABASE.md. Organizer-owned events must not become orphaned. Cancelled events and registrations retain status history unless a verified deletion/privacy request requires removal.
- **Transport:** HTTPS everywhere (Vercel + Supabase defaults); HSTS by platform.

## 7. Logging

**Never log:**

- Passwords, tokens, session cookies, API keys, service-role key.
- Full request bodies of auth or profile endpoints.
- Precise user coordinates beyond operational need.

**Log:**

- Authentication failures (rate of, not content).
- Authorization denials (user id, route, reason) — useful for debugging RLS.
- Server errors with request id.
- Consequential actions: event cancel, role change, admin moderation.

## 8. File Uploads

- **MVP default:** event images are external URLs, validated as `https:` URLs. No upload surface exists, which removes the risk entirely.
- **If uploads are implemented (P1+):** Supabase Storage bucket, image MIME allowlist (`image/jpeg|png|webp`), max 5 MB, server-validated, random object keys, public-read only for event images, never executable content, and the bucket is not listable by clients.

## 9. Security Checklist

- [ ] Authentication implemented (Supabase Auth + @supabase/ssr)
- [ ] Authorization implemented server-side (role + ownership) for every mutation
- [ ] RLS enabled on every table exposed via Supabase APIs, policies verified with tests (TESTING.md)
- [ ] Server-side validation on all inputs
- [ ] Capacity + deadline + duplicate-registration enforced transactionally
- [ ] Secrets protected (env only, `.env.example` clean, service-role server-only)
- [ ] Admin role not self-assignable (verified)
- [ ] Sensitive data protected (location owner-only, no attendee emails to organizers)
- [ ] Rate limiting considered (platform limits documented)
- [ ] File uploads validated (or URL-only rule upheld)
- [ ] Errors do not expose sensitive details
- [ ] Dependencies reviewed (npm audit, no abandoned/typosquatted packages)
- [ ] Location permission is opt-in with an explanation, and the app works fully when denied
