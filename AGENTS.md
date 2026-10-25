# AI Coding Agent Instructions

## 1. Project Context

**Project:** Hyperlocal Events — a hyperlocal event discovery & community engagement platform.
**Purpose:** Help attendees discover relevant nearby events (SmartMatch recommendations + map/radius discovery) and help organizers publish events, manage registrations, and measure real engagement. Built for a 24-hour hackathon.
**Primary Users:** Attendees, Organizers, Admins (minimal moderation).
**Stack (fixed):** Next.js + TypeScript + Tailwind CSS + shadcn/ui, Supabase (PostgreSQL, Auth, RLS, `@supabase/ssr`), MapLibre GL JS (free tiles), Recharts, Vitest, Playwright, Vercel free tier. Free and open-source / free-tier only — no paid APIs, no paid AI, no exceptions without the user's explicit approval.

## 2. Source of Truth

Before significant changes, read the relevant documents in `docs/` at the repository root (keep this `AGENTS.md` at the repository root):

- `PRD.md` — what we are building, scope (P0/P1/P2), acceptance criteria
- `TRD.md` — the tech blueprint: fixed stack + versions, dependency allowlist, external services, internal API contracts, SmartMatch/maps/auth specs. Build only with what it lists
- `DESIGN_SYSTEM.md` — how it must look (standout editorial-premium, never generic template UI)
- `ARCHITECTURE.md` — how the system works, structure, dependency rules, decisions
- `DATABASE.md` — schema, constraints, indexes, migration rules
- `SECURITY.md` — auth, authorization matrix, RLS, secrets rules
- `CODE_STYLE.md` — how code is written
- `TESTING.md` — how work is proven

Do not contradict these documents without first identifying the conflict (see §8). If code and docs disagree, flag it; the docs are the intent, the code may be mid-implementation.

## 3. General Rules

- Understand existing code before modifying it; preserve working code and the existing stack unless a change is necessary and justified.
- Reuse existing components and utilities; do not create duplicates.
- Follow the design system (tokens only — no arbitrary colors), architecture (dependency rules), database conventions, security requirements, and code style.
- Do not invent business requirements, credentials, API keys, test results, deployment URLs, or functionality. If something is unknown, mark it as an open question.
- Never hardcode secrets. `.env.example` documents variables with no real values. Never expose the service-role key to the browser.
- Avoid unnecessary dependencies; prefer the standard library and platform features.
- Avoid unrelated changes. Keep the project deployable at all times.
- Implement and verify RLS policies and server-side authorization — security is P0, not polish.
- Prioritize in this order: secure P0 end-to-end flow → database integrity and RLS → SmartMatch USP → P1 enhancements → visual polish. Deploy a working slice early; do not delay first deployment until the final minutes.
- Label seeded/demo data as demonstration data; never present generated statistics as real outcomes.
- Do not claim a feature works unless it was implemented and tested; do not claim deployment succeeded unless it actually did.

## 4. Planning

Before implementing a non-trivial task:

1. Inspect the relevant documentation ( §2 ).
2. Inspect the relevant existing code.
3. Identify affected files, dependencies, and any database/API changes.
4. Identify the tests required (TESTING.md).
5. State a concise plan, then proceed — in this hackathon, do not stop at a plan or repeatedly ask for approval on routine implementation decisions. Ask only when a decision is genuinely the user's (scope cuts, missing credentials, conflicting requirements).

## 5. Implementation

- Make focused changes, one coherent feature at a time; follow the phase order when in doubt: foundation → discovery UI → backend/auth → SmartMatch + map → engagement → tests → deploy → polish.
- Reuse established patterns; preserve existing behavior outside the task.
- Use the simplest reliable solution that satisfies the requirements (Haversine before PostGIS, in-app notifications before email, URL images before uploads). Registration/cancellation integrity must live in PostgreSQL transactions/functions; never emulate a transaction with multiple independent Supabase requests.
- If a required external credential is unavailable, implement everything else, wire the integration behind environment variables, and explain exactly how to configure the missing credential.

## 6. Validation

After implementation, in this order:

1. Run the tests (`npm run test`; E2E where applicable).
2. Run linting (`npm run lint`) and type checking (`npm run typecheck`).
3. Run the production build (`npm run build`).
4. Review the changed files for unintended changes and leaked secrets.
5. For UI work, verify the actual flow in a browser against DESIGN_SYSTEM.md states (loading/empty/error/success).

Report the *actual* results, including failures. A check that was not run is reported as not run.

## 7. Documentation

Update the docs when implementation changes product behavior, architecture, database schema, API contracts, security rules, or conventions. Keep docs and code aligned within the same change whenever practical.

## 8. Conflict Handling

If requirements conflict — between docs, between a doc and the code, or between instructions — do not guess. Identify the conflict explicitly, state the options and their impact, and ask the user to decide. Security rules (SECURITY.md) win over convenience in any conflict the agent resolves itself.

## 9. Completion Criteria

A task is complete only when:

- The PRD requirements it targets are satisfied.
- Tests pass, lint and type checking pass, and the build succeeds — all actually run.
- No unintended files changed; no secrets committed.
- Security rules are respected (authorization + RLS verified where touched).
- Documentation is updated where behavior changed.
- The completion report lists: features implemented, tests executed with real results, deployment status (real URL or "not deployed"), and known limitations/incomplete items — honestly, even when the answer is unflattering.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
