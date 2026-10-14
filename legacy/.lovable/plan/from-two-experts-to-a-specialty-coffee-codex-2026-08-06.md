# From two experts to a specialty-coffee codex

Right now the Professor's expertise lives in one paragraph of prompt text naming a handful of people, so the AI keeps falling back on the two names it recognizes best. The fix is two layers: a real curated knowledge base the app always grounds in, plus a live lookup that pulls published sources for the specific coffee and gear in front of you — with full, expandable references in every guide.

## Layer 1 — Curated knowledge base (always on)

A structured, in-app corpus instead of a name-drop list. Each entry has: source name, author/organization, type (standard, research, book, competition routine, roaster method, article), year, the domain it covers (extraction, grind, water, pour technique, immersion, espresso, roast phases, heat transfer, defects, sensory), and the concrete claims/numbers it contributes.

Coverage to seed:
- **SCA standards & protocols** — Golden Cup / brewing control chart (extraction yield and strength targets), water quality standard, cupping protocol, roast color/degree, green grading, brewing water composition.
- **Research & reference texts** — extraction and grind-distribution work, water chemistry (Hendon/Colonna-Dashwood), Rao's roasting and rate-of-rise material, Hoffmann's reference work, Illy/Viani espresso science, Gagné's extraction writing.
- **Competition methods** — documented WBC/World Brewers Cup routines across many years and competitors, not just two.
- **Roaster methods** — published profiles/philosophies from Wendelboe, La Cabra, Onyx, Sey, Coffee Collective, George Howell, Nomad, Manhattan, Tim Hill, and others.
- **Origin/terroir references** — regional characteristics and processing chemistry by growing region.

Retrieval: before each generation, the server selects the entries that actually match the request (device class, roast machine, origin region, process, target profile, stated goal) and injects only those into the prompt, with an explicit instruction that every number must be traceable to a named source and that SCA standards are the baseline any deviation must be justified against.

## Layer 2 — Live lookup (per request)

For the specific coffee and equipment on screen, the app runs a web research pass at generation time (Firecrawl connector for search + page reading) targeting roaster pages, SCA publications, competition write-ups, and reputable specialty publications. Results are summarized into source cards with real URLs and merged with the curated corpus.

Guardrails: capped number of lookups per generation, short timeout, and a clean fallback — if research fails or returns nothing usable, the guide still generates from the curated corpus and says so. Results cache by coffee/device so repeat runs are fast and cheap.

## Layer 3 — Full expandable references in the output

Every guide gains a **References** panel below the recipe:
- Inline attribution stays in the body ("adapted from …").
- A sources list showing name, type badge (SCA standard / research / competition / roaster / article), year, and link where one exists.
- Each source expands to show exactly what it contributed to this guide — the parameter, the claim, and the reasoning.
- An **SCA compliance** line stating whether the recipe sits inside SCA Golden Cup and water-standard ranges, and where it deliberately departs and why.

Saved notebook sessions store the references alongside the recipe so an old session still shows its sourcing.

## Technical notes

- New `src/lib/knowledge/` module: typed corpus entries plus a scoring/selection function; no database needed for the curated layer.
- `coffee.server.ts` builds the prompt from selected corpus entries + live findings, and switches to a structured response so recipe text and reference records come back as separate fields instead of one markdown blob.
- Live research runs in a server-only helper behind the existing `generateBrewGuide` / `generateRoastGuide` server functions; Firecrawl needs a connector to be linked (a connect card will appear during the build).
- `sessions.recommendation` stays as-is; references are added as a new JSON column via migration.
- New `ReferencePanel` component in the lab result view, styled to the existing lab-card system and collapsed by default on mobile.
- Model stays `openai/gpt-5.6-sol` on the streaming Responses path already in use.

## Tradeoffs

Guides will take longer to generate (live research adds a step) and cost more per run. The curated layer alone is instant; the live layer is what keeps it current. If generation time becomes annoying, live lookup can become a toggle.
