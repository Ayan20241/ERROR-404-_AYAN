# Hyperlocal Events — Development Specification Pack

This pack contains the revised project requirements for development. `AGENTS.md` belongs at the repository root; place all files in `docs/` in the repository `docs/` directory.

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

The project should expose these scripts once scaffolded: `npm run dev`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`, and `npm run build`. If a script cannot be implemented or run, report that fact instead of claiming success.

## Critical database rule

Registration and cancellation must be atomic database operations. Keep registration history but allow at most one active registration per attendee/event. Use a partial unique index on active rows and a tested transaction/function that updates `registered_count` exactly once. Do not rely on client-side checks or multiple independent HTTP calls for capacity safety.
