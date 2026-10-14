# Architecture and migration design

## Topology
Expo React Native TypeScript app (iOS/Android)
 -> typed API layer with authentication and rate limits
 -> AI orchestration/retrieval service (server-only model and research keys)
 -> Supabase Auth / PostgreSQL / object storage (with enforced RLS)
 -> vetted source corpus with metadata, passage and claims tables.

Recommended monorepo structure:
```
apps/mobile/                 # Expo Router, screens, components, assets
services/api/                # Independent Node/TypeScript API (or comparable managed backend)
packages/domain/             # Pure types, zod schemas, equipment logic, recipe contracts
packages/research/           # ingest, retrieval, evidence validator, evaluation fixtures
supabase/migrations/         # New additive migrations, checked in
scripts/                     # staging backfill, integrity checks and export
specs/                      # this handoff documentation
```
Do not import web-only Radix, TanStack Start server functions, Node process env handling, or browser globals into the mobile runtime.

## Migration strategy
1. Create new repository or mobile branch; preserve legacy source read-only and tagged. No destructive modification to Lovable web app.
2. Create staging Supabase, apply reviewed base SQL migrations, import sanitized synthetic test users/sessions. Never copy production auth database directly to local.
3. Compare `profiles`, `sessions`, `references_json`, `chat_json`, and any later Drizzle changes to the **deployed** database, not just checked-in SQL. Inspect actual schema before backfill.
4. Reuse Supabase project/Auth only if owner deliberately chooses continuity; confirm Google OAuth redirect settings, email delivery, and data-controller responsibilities. Production migration needs backup + tested rollback + maintenance window if applicable.
5. Add new tables via additive migrations: `equipment`, `coffee_lots`, `session_events`, `source_documents`, `source_passages`, `source_claims`, `claim_evidence`, `research_runs`, `generation_provenance`; avoid requiring all of them in first sprint.
6. Introduce versioned schema for guides; preserve legacy `recommendation` text and `references_json` as snapshots.
7. Use mobile deep links (e.g. `beanprofessor://auth/callback`) plus approved HTTPS universal links; configure app identifiers and OAuth providers after owner chooses bundle IDs.

## Example versioned guide contract (outline)
```
{
  "schemaVersion": 2,
  "kind": "brew | roast",
  "equipmentId": "...",
  "inputs": {},
  "steps": [{"instruction":"...", "durationSeconds": 45, "evidenceIds":["ev1"]}],
  "parameters": [{"name":"water_temperature", "value":94, "unit":"C", "evidenceIds":["ev2"]}],
  "assumptions": [],
  "uncertainties": [],
  "evidence": [{"id":"ev1", "documentId":"...", "passageId":"...", "url":"...", "quoteLocation":"page 4"}],
  "review": {"mechanicalSafety":"pass", "citationCoverage":"pass|partial|fail"}
}
```
All types should be formally implemented in Zod + TypeScript and validated server side.

## Runtime and cost
- Prefer a fast retrieval-backed recommendation on already indexed material; add live research only if needed and license permits.
- Server caches stable source lookups; cache keys include input/equipment and corpus version. Do not cache personalized content across users without isolation.
- Seven seconds is a product target for ordinary cached guide generation, not a guaranteed timeout for all requests. Track p50/p95. Display progress/status and graceful retries.
- Streaming chat may return earlier than full guide creation; mobile client must handle cancellations, stale requests and offline errors.
- Implement cost quotas and rate limits, abuse protection and background cleanup of scans.
