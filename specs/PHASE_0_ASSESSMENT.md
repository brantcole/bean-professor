# Bean Professor 2.0 — Phase 0 assessment

Phase 0 discovery is complete. The existing application provides a useful product reference and data model. It needs a new native interface and independent backend before it can meet the mobile and evidence requirements. Implementation has not begun.

## Scope and provenance

- Reviewed Git commit `83ac38b99240750a0855506d926f4bf0b2ef4505` on the uploaded `main` branch.
- This commit contains two ZIP archives, rather than an unpacked `legacy/` directory. Extracted reference copies into `/workspace/bean-professor-assessment/legacy` and `/workspace/bean-professor-assessment/migration`, outside the Git checkout.
- Read both `AGENTS.md` files, `00_START_HERE.md`, all five numbered specifications, and the phase prompts. Inspected routes, application components, authentication, server AI integrations, corpus definitions, SQL migrations, asset descriptors, and dependency configuration.
- Compared all 128 extracted legacy files and 18 migration-package files against their archive contents using SHA-256: every file matches. The original Git checkout remains clean.
- No application, database, OAuth, Lovable gateway, Firecrawl, or production requests were made. No dependencies were installed, services started, source files changed, migrations applied, or paid services provisioned.
- The only network operation for this phase was reading the requested GitHub branch. This assessment describes source behavior, not proof of deployed behavior.

## What exists and how it maps to the target

Paths below refer to the extracted reference directories beside this report.

| Area | Existing implementation and evidence | Recommendation |
|---|---|---|
| Platform | `legacy/package.json`, `vite.config.ts`: React 19, TypeScript, TanStack Start/Router, Vite, Tailwind, Radix, and Lovable build integration | Create Expo/React Native mobile application; rebuild screens and routing |
| Coffee School | `legacy/src/routes/index.tsx`, `components/ProfessorChat.tsx`, `lib/professor-chat.server.ts`: public educational chat with starter questions and streamed text | Preserve teaching flow and context concepts; add structured claim citations, independent API, optional conversation saving |
| Brew Lab | `legacy/src/routes/brew.tsx`, `lib/coffee-types.ts`, `lib/coffee.functions.ts`: equipment, beans, process, roast, grinder, water, dose, goal, scanned notes | Reuse field concepts and starter equipment; normalize measurements and bind each result to the inputs used to generate it |
| Roast Lab | `legacy/src/routes/roast.tsx`, `lib/coffee.server.ts`: green-coffee inputs and generated profile | Reuse input concepts; replace generic machine instructions with verified capabilities and enforceable constraints |
| Journal | `legacy/src/routes/_authenticated/notebook.tsx`, `lib/coffee.functions.ts`: save/list notes, ratings, guide, references, chat; update/delete sessions | Preserve historical records through a compatibility adapter; add search/filter, export, account deletion, offline reads, and structured observations |
| Photo intake | `legacy/src/components/LabelScanner.tsx`, `lib/vision.server.ts`: browser camera/file input, compression, server extraction, confidence category | Rebuild with native permissions and image handling; require editable confirmation before applying recognized fields |
| Timer | `legacy/src/components/LabStopwatch.tsx`: elapsed display, pause/resume/reset, named marks | Preserve interaction concepts; implement durable timer/event state, lifecycle recovery, and clock-change behavior |
| Authentication | `legacy/src/routes/auth.tsx`, `reset-password.tsx`, `integrations/lovable/index.ts`, `integrations/supabase/*`: Supabase email/password, browser reset redirects, Lovable Google OAuth | Replace browser and Lovable dependencies with native linking, secure storage, and independently tested provider configuration |
| Research | `legacy/src/lib/knowledge/corpus*.ts`, `select.ts`, `validate.ts`, `research.server.ts`: source summaries, heuristic selection, optional web lookup, format checks | Import as unverified candidates; build verified document/passages and claim-evidence mapping |
| Branding | `legacy/src/styles.css`, `components/AppShell.tsx`, asset descriptors; supplied logo in `migration/assets` | Preserve laboratory/coffee visual identity and logo; translate semantic colors and typography into accessible native styling |

## Reuse decisions

**Adapt into shared domain code:** brew/roast field definitions, equipment lists, source-category concepts, session/reference shapes, and bounded-input validation patterns. `summarizeLabel` can be adapted as a pure utility. Numeric quantities currently use strings; the new contracts should distinguish number, unit, and unknown values. `matchOption` uses broad substring/first-token matching and should be replaced or tightened before automatically suggesting matches.

**Preserve as historical data:** recommendation text, inputs, notes, ratings, timestamps, references, chat, and the old `sca_compliance` field. Historical statements should remain visible as historical content, without being relabeled as independently verified advice.

**Use as design references:** form layout, educational starter questions, guide/chat/journal workflow, named timer events, palette, typography, and lab labels. The provided 1254 × 1254 logo is available; it needs native icon/splash review. The legacy favicon is only 64 × 64.

**Rewrite for native or independent services:** HTML/CSS/Radix components, browser image processing, browser storage, favicon logic, TanStack server functions and web routes, Lovable preview authentication, gateway integrations, and web error-reporting hooks. Existing TypeScript does not make these components directly portable to React Native.

## Priority findings

### 1. The citation badge overstates what the validator checks

`legacy/src/lib/knowledge/validate.ts` accepts a reference if its title matches, its author matches an author in the selected catalog, or its URL/title matches a live finding. It does not require the cited document to support the claim. An empty reference name can match any catalog title because every string contains an empty string. Reference count/type requirements do not establish evidence quality.

I ran the existing pure validator locally with synthetic inputs: invented reference titles sharing a known author, an empty-title reference, and an unsupported mid-roast power-change instruction. The result was `passed: true`, with no issues or ungrounded references. This confirms an implementation weakness without accessing a model or database.

The new service should validate source IDs, passage IDs, source attribution, exact claim support, and equipment constraints separately. Preserve historical badges as historical output only. Replace new-result “SCA validator passed” wording with accurate evidence and safety status.

### 2. The catalog is a discovery starting point

Loading the local, data-only corpus definitions confirmed 271 entries: 37 base, 43 extended, and 191 library entries. There are 23 standards-category entries, 56 research, 34 books, 47 competition, 35 roaster, and 76 article entries. These are application labels, not independently verified classifications.

Only 31 entries contain a URL, representing 23 distinct URL strings. Several URLs point to organization homepages or general libraries. IDs are unique, but titles repeat and some entries describe broad collections or community practice instead of a specific publication. There are no passage locations, document versions, usage-rights records, or verification statuses in the current entry type. The 70 welcome facts contain text/source labels without a verification ledger.

`select.ts` chooses up to 26 entries for guides and adds random ranking jitter; chat asks for 30. This is selection among summaries, not retrieval from the underlying publications. `research.server.ts` searches at most three queries/four results each, stores short snippets, silently falls back on errors, and caches results for six hours in process memory. No individual external source was verified during Phase 0.

Start with a small rights-cleared evidence set for the primary journeys, then expand toward 250+ verified entries. Count verified documents and accessible passages separately from legacy candidates.

### 3. Original Behmor guidance is internally inconsistent

`coffee-types.ts` and the catalog assert that original-model settings are locked after Start. The same code describes A–D as power levels and mentions a drum-speed toggle. These button/control claims need an exact original-model manual and confirmation of any upgraded control panel.

`coffee.server.ts` nevertheless requests charge/drop temperatures, turning point, and “Heat & Airflow Moves.” The numeric validator requires charge-related numbers and development information, but has no equipment argument or mechanical-safety check. Chat repeats the locked-settings rule only as a prompt instruction. Do not encode these copied assertions as established manufacturer facts.

Use verified model capabilities to determine allowed controls and output fields. For the original Behmor, unsupported sensor/control instructions must fail independently of citations. Allow uncertain roast timing to be labeled honestly. The exact manual and hardware variant remain unresolved.

### 4. Protect the database and user identity before migration

Checked-in Supabase SQL creates `profiles` and `sessions`, owner-based row-level security, updated timestamps, and a signup profile trigger. A later Supabase migration adds `references_json` and `sca_compliance`; a separate Drizzle migration adds `chat_json`. Application queries depend on all three fields. The Drizzle schema file is empty and the SQL alone does not establish deployed schema state.

Journal handlers use authentication middleware and a user-scoped Supabase client. Their update/delete operations rely on row-level security; they do not check that a row was actually affected before returning success. These are useful patterns to improve and test in staging, not proof that production security currently works.

Preserve session IDs, ownership, timestamps, free text, nulls, references, and chat. A separate staging Auth project may assign different user UUIDs: an explicit identity mapping is required before importing owner-linked records. Do not copy the production Auth database into local development.

### 5. AI operations need cost and trust controls

`coffee.functions.ts` protects journal operations but does not require authentication for guide generation or scans. `routes/api/professor-chat.ts` likewise has no visible authentication/rate-limit gate. External platform protections may exist; they were not inspected.

Guide, chat, and vision call Lovable AI endpoints with server-side keys. Research can use direct Firecrawl or a Lovable connector. Replace these dependencies with server-only provider adapters, quotas, rate limits, payload limits, timeout/cancellation, and redacted errors. Treat label content, retrieved text, and client-supplied guide context as untrusted input. The guide JSON helper parses then casts its result rather than validating it against a runtime application schema.

### 6. Session and native reliability need deliberate work

- Scan results immediately prefill the form; confidence is model-reported and there is no explicit confirmation step. Clearing the scan preview does not undo those form values. Native intake needs a review screen and clear retention/third-party processing consent.
- Generated guides are rendered and saved alongside the current editable form. Editing fields after generation, or during a pending generation, can associate the guide with different inputs. Persist the exact request snapshot with each result.
- Timer state and marks are component-local and are not passed to journal saving. Timestamp arithmetic can catch up while the component remains mounted, but `Date.now()` is sensitive to system-clock changes and state is lost on unmount/reload. Background, suspension, process death, and event persistence need native tests.
- Journal listing fetches all accessible sessions with no pagination/search/filter. Query failures can be displayed as the empty-state message. Chat-save errors are sometimes suppressed. Sign-out through AppShell does clear the query cache, which is a useful existing safeguard; the new cache should also be explicitly scoped to user identity.
- Current chat emits text without structured per-claim evidence. Native source viewing needs a typed evidence contract, not just names in prose.
- The legacy root forces dark mode. Splash dismissal and typography need native screen-reader, reduced-motion, dynamic-type, contrast, and safe-area checks.

### 7. Build and asset readiness are unverified

The manifest includes dev/build/lint/format commands but no test or dedicated typecheck command. No test files or CI workflows were found. `package-lock.json` and `package.json` differ for three TanStack declarations and Lovable build configuration; Drizzle/Postgres dev dependencies are absent from the lockfile root. Frozen npm reproducibility is therefore unresolved. No install/build was attempted during read-only discovery, and the Bun lockfile was not validated against an installation.

The logo and café background in legacy source are hosted asset descriptors. The package supplies the logo binary but no café background binary. Obtain the original authorized image before implementing that background. Do not scrape or silently replace it. Font licenses and redistribution rights also need confirmation.

### 8. Archived configuration is tracked

The original ZIP includes `.env`, so its contents are distributed in Git even though `.env` is not a separately tracked path. The legacy `.gitignore` does not exclude `.env`. The six archived variable names are `SUPABASE_PROJECT_ID`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, and their `VITE_` counterparts. The two key values use Supabase publishable-key format; values were not printed or reused.

A limited local literal-pattern scan found no private Supabase key, common provider private key, GitHub token, or private-key block. This is not a comprehensive security clearance or an audit of the original Lovable Git history, which is not supplied here. Do not rotate public publishable keys solely because they are public. Investigate/rotate genuine private credentials if discovered, without rewriting connected Lovable history or changing production configuration without authorization.

## Recommended structure and smallest useful sequence

After approval, use the existing task checkout; no extra Git worktree is needed. Keep the archives and legacy reference intact. Make the migration instructions discoverable at the new repository root, with the full handoff in `specs/`.

```text
legacy/                     preserved reference; exclude archived .env from new app
specs/                      migration requirements and decisions
apps/mobile/                Expo Router, native screens, approved assets
services/api/               authenticated versioned API and provider adapters
packages/domain/            types, runtime schemas, equipment capabilities
packages/research/          candidate ingestion, retrieval, evidence evaluation
supabase/migrations/        reviewed new additive schema changes
scripts/                    staging-only import, checks, export and rollback helpers
```

1. **Phase 1, foundation:** mocked four-tab navigation, settings entry, original logo, accessible native components, strict typing, lint, unit tests, navigation/screenshot checks, and CI. No production integration or paid provisioning. Completion requires both platforms' navigation to be validated, with simulator/device limitations reported honestly.
2. **Phase 2, auth and journal:** separate staging environment, native confirmation/reset/Google flows, secure session persistence, legacy adapter, user-isolation tests, journal edits/deletion and offline read-only cache. Use synthetic data first.
3. **Phase 3, evidence backend:** fake provider in tests, independent interfaces, typed/versioned contracts, small verified corpus, deterministic retrieval, claim evidence, authentication and cost controls. Activate a real provider only with approved budget and secure configuration.
4. **Phase 4, complete brew journey:** photo permissions and editable confirmation, equipment-aware guide, source viewer, request snapshots, saving and timer events. Prove one complete journey before broadening equipment coverage.
5. **Phase 5, Coffee School:** evidence-backed chat, optional conversation saving, verified welcome ledger, accessible source viewing, and offline/error behavior.
6. **Phase 6, roasting:** basic green-coffee/journal flow plus verified device profiles, independent constraint checks, first-crack/cooling events, and background timer validation. Detailed Behmor button recommendations remain gated on manual verification.
7. **Phase 7, beta:** device matrix, privacy/deletion/export, expert evaluation, latency/cost measurements, signing and store preparation. Publication and new charges require separate approval.

## Test and rollback plan

Each phase should have acceptance tests alongside implementation. Cover malformed/legacy records, unit conversions, generated-result/input fidelity, fake citations, missing or conflicting passages, prompt injection, device constraints, provider errors, quotas, cancellation, and duplicate requests. Staging must prove user A cannot read/change/delete user B's rows or photos. Verify email and OAuth links on cold and warm launches on physical iOS and Android devices. Test denied camera permission, HEIC/large images, poor networks, cache isolation, offline journal reads, and timer suspension/clock changes/process recovery.

For migration, first inventory the owner-approved deployed schema read-only, then rehearse on staging with synthetic or separately authorized sanitized data. Use a versioned idempotent adapter, explicit identity mapping, import batches, source IDs and checksums, row-count/fidelity comparisons, and an export that preserves original snapshots. Test duplicate imports and recovery before any production work.

Production remains a separate approval gate. Before a future production migration, require a verified backup and restore rehearsal, exact schema/identity comparison, reviewed additive changes, and a release rollback plan. Prefer rolling back the mobile/API release while leaving compatible additive tables in place. Any reversal of imported records must be scoped to a recorded batch and explicitly authorized; never use a blanket reset or delete historical journals. Keep the Lovable app operational throughout.

## Decisions to confirm

Only Phase 1 approval is needed to begin the mocked foundation. The following decisions gate later integrations:

1. Who owns/administers the existing Supabase and Lovable projects, and should existing accounts remain continuous with the mobile app? Is a separate staging Supabase project available?
2. Which AI/research providers and monthly spending limit are acceptable? Should public educational access have an anonymous quota?
3. Which corpus documents may legally be indexed or quoted, and who will review coffee claims before beta?
4. What exact Behmor model/control panel is installed, including upgrades, and which original manual applies? What exact Calphalon espresso model is used?
5. Can the authorized original café photo and artwork/font usage rights be supplied or confirmed?
6. Who owns Apple Developer, Google Play, and Expo accounts? What bundle/application identifiers and public support/privacy identities should be used? These do not block mocked scaffolding.

## Commands and outcome

GitHub branch read and checkout: successful; first checkout using `origin/main` failed because the fetch did not create that tracking ref, so checkout used the verified `FETCH_HEAD`. Local repository remains clean. Archive enumeration/extraction, source reads/searches, manifest/lock comparison, credential-name/pattern inspection, data-only corpus loading, synthetic validator counterexample, file hash comparison, and final Git diff/status checks completed. No application suite, lint, build, deployed RLS test, authentication flow, live AI evaluation, or device build was run. There is no claim of runtime readiness.

## Approval and exact next prompt

Phase 0's discovery prompt says: “STOP. Ask owner to approve moving to Phase 01. Do not modify repository or provision paid services in this phase.” Implementation is paused pending the owner's approval, as also requested in chat.

Suggested next prompt:

> I approve Phase 1 only. Read AGENTS.md, 00_START_HERE.md, all numbered specifications, and PROMPTS/01_FOUNDATION.md. Create the Expo React Native TypeScript foundation, mocked four-tab navigation and settings, shared domain/API scaffolding, accessible styling with the supplied logo, and lint/typecheck/unit/navigation checks with CI. Preserve the original ZIP archives and legacy application unchanged. Use mocked data; do not access production, change OAuth, run database migrations, provision paid services, or make live AI requests. Report modified files, checks actually run, limitations, and the next phase prompt, then stop for approval before Phase 2.
