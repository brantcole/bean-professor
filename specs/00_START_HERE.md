# The Bean Professor 2.0 | Codex handoff

This package is an implementation specification and migration plan **grounded in the supplied Lovable repository**. It is not a completed, tested mobile app. Do not treat any existing AI output or catalog entry as independently verified.

## Product decision
Build iOS and Android with React Native + Expo + TypeScript. Reuse audited TypeScript domain concepts and Supabase data where safe; replace the TanStack web UI, Lovable-only auth and AI gateway dependencies, and unsupported web route/server conventions. Build against staging before touching production.

## Read in this order
1. `01_SOURCE_AUDIT.md` for what exists and risks.
2. `02_PRODUCT_REQUIREMENTS.md` for screens, features, and acceptance criteria.
3. `03_ARCHITECTURE_AND_DATA.md` for target infrastructure and migration.
4. `04_RESEARCH_AND_CITATIONS.md` for the research system and verification requirements.
5. `05_SECURITY_TESTING_RELEASE.md` for security, testing, privacy and app stores.
6. `AGENTS.md` for persistent Codex instructions.
7. `PROMPTS/` one phase at a time. Phase 00 requires permission before modifying anything.

## What you need to supply Codex
- The original Lovable repository at its current GitHub location. Keep it as a separate `legacy/` reference or sibling directory, not pasted into the Expo app.
- This package's `AGENTS.md`, `PROMPTS/`, and specs in the *new* mobile repository.
- An account with suitable development permissions and a **separate staging Supabase project**. Provide credentials only through approved secret management, never chat or source control.
- Rights-approved artwork. `assets/bean-professor-logo-original.png` is the user-provided logo, not an automatically created icon specification.

## First Codex instruction
Open `PROMPTS/00_DISCOVERY.md` and execute only its read-only discovery phase. Present the implementation plan and questions; wait for approval before modifying code or running database migrations.

## Important caveat
The ZIP's `.env` contains Supabase project configuration and public/publishable values. It is deliberately **not copied here**. Check the original Git history and rotate/revoke any secrets accidentally committed. Never expose a service-role key, AI key, or private credential in an Expo client.
