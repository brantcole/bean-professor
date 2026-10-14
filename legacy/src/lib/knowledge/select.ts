import { CORPUS } from "./corpus";
import type { Domain, KnowledgeEntry } from "./types";

const DEVICE_DOMAINS: { match: RegExp; domains: Domain[] }[] = [
  { match: /espresso|flair|lever|calphalon|breville|gaggia/i, domains: ["espresso", "pressure", "grind"] },
  { match: /moka|bialetti|stovetop/i, domains: ["pressure", "espresso"] },
  { match: /aeropress/i, domains: ["immersion", "extraction"] },
  { match: /french press|press pot/i, domains: ["immersion"] },
  { match: /siphon|vacuum/i, domains: ["immersion", "heat-transfer"] },
  { match: /chemex|v60|bee house|kalita|clever|pour ?over|dripper|cone/i, domains: ["pourover", "extraction"] },
  { match: /cold brew/i, domains: ["immersion", "extraction"] },
];

function tokenize(context: string) {
  return context.toLowerCase();
}

function scoreEntry(entry: KnowledgeEntry, ctx: string, wanted: Set<Domain>) {
  if (entry.core) return 1000;
  let score = 0;
  for (const d of entry.domains) if (wanted.has(d)) score += 3;
  for (const tag of entry.tags ?? []) if (ctx.includes(tag.toLowerCase())) score += 6;
  if (ctx.includes(entry.author.toLowerCase())) score += 4;
  return score;
}

/**
 * Pick the corpus entries that actually bear on this request.
 * SCA standards are always included; the rest is scored by device class,
 * origin/process keywords and the user's stated goal.
 */
export function selectKnowledge(options: {
  kind: "brew" | "roast" | "learn";
  context: string;
  limit?: number;
}): KnowledgeEntry[] {
  const ctx = tokenize(options.context);
  const wanted = new Set<Domain>(
    options.kind === "brew"
      ? (["extraction", "grind", "water", "sensory", "terroir"] as Domain[])
      : options.kind === "roast"
        ? (["roast-phases", "heat-transfer", "defects", "green", "sensory", "terroir"] as Domain[])
        : ([
            "extraction",
            "grind",
            "water",
            "pourover",
            "immersion",
            "espresso",
            "pressure",
            "roast-phases",
            "heat-transfer",
            "defects",
            "sensory",
            "green",
            "terroir",
          ] as Domain[]),
  );

  for (const rule of DEVICE_DOMAINS) {
    if (options.kind !== "roast" && rule.match.test(ctx)) rule.domains.forEach((d) => wanted.add(d));
  }

  const limit = options.limit ?? 26;
  // Small random jitter rotates equally-relevant sources between requests so
  // the whole library gets consulted, not the same handful every time.
  const scored = CORPUS.map((entry) => ({
    entry,
    score: scoreEntry(entry, ctx, wanted) + Math.random() * 2.5,
  })).filter((row) => row.score > 2.5);
  scored.sort((a, b) => b.score - a.score);
  // Guarantee breadth: cap any single author at 2 entries.
  const perAuthor = new Map<string, number>();
  const picked: KnowledgeEntry[] = [];
  for (const row of scored) {
    const n = perAuthor.get(row.entry.author) ?? 0;
    if (n >= 2 && !row.entry.core) continue;
    perAuthor.set(row.entry.author, n + 1);
    picked.push(row.entry);
    if (picked.length >= limit) break;
  }
  return picked;
}

/** Render selected entries as prompt-ready text. */
export function renderKnowledge(entries: KnowledgeEntry[]) {
  return entries
    .map((e) => {
      const head = `[${e.id}] ${e.name} — ${e.author}${e.year ? `, ${e.year}` : ""} (${e.type})${
        e.url ? ` <${e.url}>` : ""
      }`;
      return `${head}\n${e.claims.map((c) => `  - ${c}`).join("\n")}`;
    })
    .join("\n\n");
}
