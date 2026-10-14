# Audited Lovable implementation

Repository inspected from user-uploaded `bean-professor-brew-roast-main.zip`. Static inspection only, no production login, model tests, live API requests, or device builds performed.

## Technology actually used
- TanStack Start + TanStack Router + Vite + React 19 + TypeScript, Tailwind and Radix web components.
- Supabase JS and auth integration; SQL migrations for `profiles` and `sessions` with row-level security.
- Lovable cloud-auth integration for Google OAuth and gateway-dependent server AI features.
- Drizzle migration for session chat (check for duplicate schema ownership and deployed status).

## Grounded feature map
| Feature | Evidence in legacy repo | Migration action |
|---|---|---|
| Home / Coffee School | `src/routes/index.tsx`, `src/components/ProfessorChat.tsx` | Rebuild native screen; research-backed chat |
| Brew Lab | `src/routes/brew.tsx`, `src/lib/coffee.server.ts` | Preserve input concepts, rewrite UI and guide API |
| Roast Lab | `src/routes/roast.tsx`, `src/lib/coffee-types.ts` | Keep original Behmor rules, revalidate machine data |
| Lab Journal | `src/routes/_authenticated/notebook.tsx`, `src/lib/coffee.functions.ts` | Maintain existing session shape via adapter and migrations |
| Image label scanning | `src/components/LabelScanner.tsx`, `src/lib/vision.server.ts` | Expo image picker/camera and secure server OCR/vision |
| Stopwatch | `src/components/LabStopwatch.tsx` | Native monotonic elapsed clock, suspend/resume reliability |
| Welcome facts | `src/components/WelcomeSplash.tsx`, `src/lib/coffee-facts.ts` | Verified facts ledger, dismissable per session |
| Login/password reset | `src/routes/auth.tsx`, `src/routes/reset-password.tsx` | Supabase native auth, deep links, verified email delivery |
| AI guide generation | `src/lib/coffee.server.ts`, `src/lib/ai-gateway.server.ts` | Secure provider adapter, evidence-first generation |
| Research integration | `src/lib/research.server.ts` | Replace Lovable connector and verify permitted sources |
| Knowledge catalog | `src/lib/knowledge/corpus*.ts` | Import as unverified candidates, audit, deduplicate |
| Automated validation | `src/lib/knowledge/validate.ts` | Claim-level evidence and mechanical device validation |

## Specific findings
- Guides rely on `https://ai.gateway.lovable.dev/v1/chat/completions`, chat uses Lovable's `/v1/responses`, and vision uses its chat endpoint. An independent app needs its own provider integration/backend.
- `src/lib/research.server.ts` references Firecrawl and `connector-gateway.lovable.dev`; its research search is capped at three queries, four results per query, and has a 3.5-second search timeout plus six-hour in-memory cache.
- `src/lib/knowledge/select.ts` defaults to 26 entries with random score jitter, caps author appearances, and ranks by tag/domain heuristic. This is catalog selection, not search over all original papers.
- `src/lib/knowledge/validate.ts` primarily validates guide shape, numerical patterns, source name/author matching, and broad source types. It does **not** entail passage-level claim verification or formal SCA certification.
- `src/lib/coffee.server.ts` allows two model attempts and fails when validation does not pass. The requested seven-second latency is not guaranteed.
- Original `Behmor 1600 (original model)` limitations appear in `src/lib/coffee-types.ts`: no manual override and no live power changes. Re-check other settings against the physical manual before publishing because copied prompts may contain contradictions.
- Web OAuth uses `lovable.auth.signInWithOAuth`, and password recovery uses browser-origin redirects. Both need native app-compatible linking and tested real emails.
- The app asset descriptors `src/assets/bean-professor-logo.png.asset.json` and `cafe-backdrop.jpg.asset.json` refer to Lovable-hosted assets rather than bundling original binary files. User-supplied logo is included separately; café background needs a rights-cleared local copy.
- Original `.env` contains Supabase URLs and publishable keys. These are not necessarily secret, but should not be copied blindly or treated as proof that a production database is safe to mutate.

## Static inspection limitations
No external facts in the coffee corpus were individually verified; no evidence was collected that all 271 catalog items are actual published, accessible sources. Verify count from repository on ingestion. No test of email confirmation, Google login, RLS in deployed environment, latency, data migration, or Play/App Store acceptance has been run.
