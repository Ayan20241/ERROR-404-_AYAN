# Code Style & Conventions

## 1. General Principles

- Prefer readable code over clever code; this codebase must survive a 24-hour hackathon *and* a judge reading it.
- Keep functions focused and small; extract when a function needs a comment to explain a section.
- Avoid unnecessary abstractions: one implementation → no interface/factory. Two real implementations → consider it.
- Reuse existing components and utilities before creating new ones.
- Prefer consistency over novelty — a slightly worse pattern used everywhere beats three better patterns used once.

## 2. Naming

- **Components:** `PascalCase` (`EventCard`, `FilterBar`).
- **Functions/variables:** `camelCase` (`scoreEvent`, `registeredCount`).
- **Constants:** `UPPER_SNAKE_CASE` for module-level constants (`SMARTMATCH_WEIGHTS`).
- **Files:** components `PascalCase.tsx`; everything else `kebab-case.ts` (`haversine.ts`, `route.ts` per Next.js convention).
- **Database fields:** `snake_case`, exactly as in DATABASE.md — never renamed in transit; map at the type layer if needed.
- **API routes:** plural nouns, REST-shaped (`/api/events`, `/api/events/[id]/register`, `/api/organizer/events`).
- **Booleans:** `is`/`has`/`can` prefixes (`isFull`, `hasCoordinates`).

## 3. Folder Structure

Follow ARCHITECTURE.md §7 exactly. Rules:

- New feature = route group under `app/` + components under `components/<feature>/` + logic under `lib/<feature>/`.
- `components/ui/` is shadcn/ui territory: primitives only, styled via the design tokens, no business logic.
- Shared types live in `types/`; database row types are generated (`database.types.ts`) and never hand-edited.
- Tests mirror the source layout under `tests/`.

## 4. Imports

- Use the `@/` alias for all project imports; no relative `../../` chains beyond one level.
- Order: node/framework → external packages → `@/` internal modules → relative → types (`import type` last in its group).
- `import 'server-only'` at the top of any module that touches the service-role key or other secrets.

## 5. Components

- Single responsibility: a component renders one concept; data fetching lives in server components or hooks, not in leaf UI.
- Server Components by default; add `'use client'` only where interactivity/browser APIs require it, and keep the client boundary as deep (small) as possible.
- Props are typed with explicit interfaces; no `any`, no untyped spread of API payloads.
- Styling: Tailwind utilities + design tokens from DESIGN_SYSTEM.md (colors, radii, fonts via the Tailwind theme). No arbitrary hex values in components — if a color isn't a token, it doesn't ship.
- Every interactive element gets its states (hover, focus-visible, disabled, loading) per DESIGN_SYSTEM.md §8–§12.

## 6. Functions

- Pure by default in `lib/` (especially `lib/smartmatch`, `lib/geo`): same input → same output, no I/O, no `Date.now()` — pass time in as a parameter so tests are deterministic.
- Validate at boundaries (route handlers, form actions); internal functions may trust validated input.
- Async functions return typed results; route handlers translate results to the standard response shape (see §7).

## 7. Error Handling

- **Use:** typed errors (`AppError` with `code`, `status`, user-safe `message`) thrown in service code; route handlers catch and return `{ error: { code, message } }` with the right HTTP status. Consistent codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION`, `EVENT_FULL`, `DEADLINE_PASSED`, `ALREADY_REGISTERED`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL`. Map database-function outcomes to these stable codes; never leak raw SQL errors.
- **Do not:** return raw exception messages/stack traces to clients; swallow errors silently; use HTTP 200 for failures; `console.log` and move on.
- Client code shows user-safe messages via toasts/inline states (DESIGN_SYSTEM.md §12) and logs detail to the console in development only.

## 8. Comments

Comments explain **why**: a business rule, a tradeoff, a non-obvious constraint (e.g. why capacity is re-checked inside the transaction). They never restate what the code says. Public/complex functions in `lib/` get a one-line TSDoc. TODOs name the missing piece and the priority (`// TODO(P1): …`), never a bare `// TODO`.

## 9. Logging

- Server: `console.error` for failures with a short context object (route, user id, error code) — never secrets, tokens, passwords, or precise coordinates (see SECURITY.md §7).
- Client: no logging in production builds except error reporting to the console in dev.
- No logging library for the MVP; the rule set matters more than the tool.

## 10. Formatting & Tooling

- **Formatter:** Prettier (repo config; 2-space indent, single quotes in TS, trailing commas where valid).
- **Linter:** ESLint with the Next.js config; zero warnings tolerated on `main` before demo.
- **Type checking:** TypeScript `strict: true`; `tsc --noEmit` must pass. `any` is banned except at untyped external boundaries, where it must be narrowed immediately.
- Tailwind classes are sorted by the Prettier Tailwind plugin where configured; otherwise grouped logically (layout → spacing → typography → color → state).

## 11. Do

- Reuse existing patterns, components, and utilities.
- Keep changes focused on one feature/fix.
- Follow the design tokens and the docs in `docs/`.
- Write or update a test when touching SmartMatch, geo, validation, or registration logic.
- Remove dead code you create.

## 12. Don't

- Create duplicate utilities or a second way to fetch data.
- Introduce dependencies for things the platform/stdlib already does (date math, distances).
- Add paid services, tracking scripts, or external calls not in ARCHITECTURE.md.
- Change unrelated files "while you're in there".
- Commit `.env` files, secrets, or generated build output.


## 13. Server/client boundary checklist

- Any module using `SUPABASE_SERVICE_ROLE_KEY`, admin operations, or private environment variables must import `server-only` and must never be imported from a client component.
- Client components must not query Supabase tables directly; use server-fetched props or the documented same-origin API.
- Route handlers follow one sequence: authenticate → parse/validate params and body → authorize role/ownership → invoke service/database operation → map typed outcome to HTTP status and standard JSON shape.
- Do not trust IDs, role, registration counts, capacity, or ownership sent by the browser. Derive identity from the session and enforce high-integrity rules in PostgreSQL.
- Do not hand-edit generated Supabase database types. Regenerate them after migrations and commit the generated output.
- Keep `.env.example` values empty or obviously fake; never copy `.env.local` into the repository or a build artifact.
