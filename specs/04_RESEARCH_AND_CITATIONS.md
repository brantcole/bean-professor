# Evidence-first coffee intelligence

## Important distinctions
`SCA standard` means the actual applicable standard/document and edition. `Published research` means checkable scientific publication. `Champion routine` and `roaster opinion` are expert practices, not interchangeable with formal standards. Do not describe the entire library as 'SCA approved' absent a documented approval process.

## Corpus ingestion
- Treat all current `src/lib/knowledge/corpus*.ts` entries as **import candidates**, not verified originals. Preserve source IDs, names, claims and legacy tags.
- Normalize title, authors, URL/DOI, publication date, publisher, edition, rights, access status, document version and category.
- Verify each entry exists and is attributed correctly, deduplicate by DOI/URL/fingerprint, and confirm usage rights before storing source text. Do not import full copyrighted books, paid papers, or championship materials without rights.
- Maintain a target of 250+ **verified catalog entries**, but report verified, pending, rejected and accessible-passage counts separately. Never game count by paraphrasing one source into many entries.
- Record SCA document titles/editions and precise passages as accessible; update as standards evolve.

## Retrieval and answering
1. Parse intent, beans, processing, brewing/roaster model, user observations.
2. Deterministically filter by applicable equipment and domain, hybrid semantic/keyword rank original passage chunks, diversify authors and types without random substitution of less relevant material.
3. For each proposed factual or numerical recommendation, build a claim->evidence mapping with source ID, passage ID, location and support/conflict status.
4. If no suitable evidence exists, label a reasonable starting-point hypothesis and explain it is unverified. Never invent URLs, quotations or standards.
5. Independently enforce hard machine constraints and numerical plausibility checks; citation agreement is not proof of mechanical safety.
6. On unsupported central claims, ask model to revise once or present partial advice with transparent warnings. Do not fabricate citation coverage to clear the gate.
7. Show a 'Why this recommendation?' viewer with source title, author, status, excerpt under permissible quotation limits, URL, and exact claim supported.

## Evaluation and quality gate
- Build a small curated gold set: Chemex washed Ethiopian, AeroPress natural, consumer espresso, French press, moka pot, original Behmor profiles, missing processing data, contradictory label, unsafe roasting request, fake quote, nonexistent URL, unsupported numerical claim.
- Automated tests reject citations to unfetched/unindexed IDs; unlicensed text; source mismatches; non-existent quote; fabricated SCA certification; unsupported original Behmor in-roast adjustments.
- Human coffee-expert review of at least 20 representative outputs before public beta. Track claim-level support rate, unsupported citation rate, precision for equipment constraints, and reproducibility across repeat prompts.
- Require no numerical minimum of citations when irrelevant; prefer three directly relevant, verifiable passages to eight superficial references.

## Welcome fact ledger
Each fact has verbatim/faithful wording, original primary source where available, source link, publication or date context, fact-check status, reviewed-on date and uniqueness tag. Quotes require exact words and attribution.
