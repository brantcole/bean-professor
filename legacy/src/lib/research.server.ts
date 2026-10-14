/**
 * Live lookup layer: searches published specialty-coffee sources for the exact
 * coffee and equipment in the request. Uses the Firecrawl connector when it is
 * linked; degrades silently to "no findings" otherwise.
 */
export type ResearchFinding = {
  title: string;
  url: string;
  snippet: string;
};

const DIRECT_BASE = "https://api.firecrawl.dev/v2";
const GATEWAY_BASE = "https://connector-gateway.lovable.dev/firecrawl/v2";
const TIMEOUT_MS = 3_500;
const MAX_QUERIES = 3;
const MAX_RESULTS = 4;

type CacheEntry = { at: number; findings: ResearchFinding[] };
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 1000 * 60 * 60 * 6;

function firecrawlRequestInit(body: unknown): RequestInit | null {
  const key = process.env["FIRECRAWL_API_KEY"];
  if (!key) return null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (key.startsWith("lovc_")) {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    if (!lovableKey) return null;
    headers["Authorization"] = `Bearer ${lovableKey}`;
    headers["X-Connection-Api-Key"] = key;
  } else {
    headers["Authorization"] = `Bearer ${key}`;
  }
  return { method: "POST", headers, body: JSON.stringify(body) };
}

function firecrawlBase() {
  const key = process.env["FIRECRAWL_API_KEY"] ?? "";
  return key.startsWith("lovc_") ? GATEWAY_BASE : DIRECT_BASE;
}

export function researchAvailable() {
  return Boolean(process.env["FIRECRAWL_API_KEY"]);
}

async function search(query: string): Promise<ResearchFinding[]> {
  const init = firecrawlRequestInit({ query, limit: MAX_RESULTS });
  if (!init) return [];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${firecrawlBase()}/search`, { ...init, signal: controller.signal });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`Firecrawl search failed [${res.status}]: ${detail.slice(0, 300)}`);
      return [];
    }
    const json = (await res.json()) as {
      data?: { web?: unknown[] } | unknown[];
    };
    const rows = Array.isArray(json.data)
      ? json.data
      : Array.isArray((json.data as { web?: unknown[] } | undefined)?.web)
        ? ((json.data as { web: unknown[] }).web)
        : [];
    return rows
      .map((row) => row as { url?: string; title?: string; description?: string; markdown?: string })
      .filter((row) => Boolean(row.url))
      .slice(0, MAX_RESULTS)
      .map((row) => ({
        title: row.title ?? row.url!,
        url: row.url!,
        snippet: (row.description ?? row.markdown ?? "").slice(0, 700),
      }));
  } catch (error) {
    console.error("Firecrawl search error:", error);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

/** Run a small, capped research pass. Never throws. */
export async function researchSources(queries: string[]): Promise<ResearchFinding[]> {
  if (!researchAvailable()) return [];
  const picked = queries.filter(Boolean).slice(0, MAX_QUERIES);
  const key = picked.join("||").toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL) return hit.findings;

  const batches = await Promise.all(picked.map((q) => search(q)));
  const seen = new Set<string>();
  const findings: ResearchFinding[] = [];
  for (const batch of batches) {
    for (const f of batch) {
      if (seen.has(f.url)) continue;
      seen.add(f.url);
      findings.push(f);
    }
  }
  cache.set(key, { at: Date.now(), findings });
  return findings;
}

export function renderFindings(findings: ResearchFinding[]) {
  if (!findings.length) return "";
  return findings
    .map((f) => `- ${f.title} <${f.url}>\n  ${f.snippet.replace(/\s+/g, " ").slice(0, 600)}`)
    .join("\n");
}
