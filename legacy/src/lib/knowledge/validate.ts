import type { GuidePayload, KnowledgeEntry } from "./types";

export type ValidationIssue = {
  code: string;
  severity: "block" | "warn";
  message: string;
};

export type ValidationResult = {
  passed: boolean;
  issues: ValidationIssue[];
  /** Sources that could not be traced back to the codex or a live finding. */
  ungrounded: string[];
};

const VAGUE_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /\bto taste\b/i, label: '"to taste"' },
  { re: /\bas needed\b/i, label: '"as needed"' },
  { re: /\bsome(?:what)? (?:more|less)\b/i, label: '"somewhat more/less"' },
  { re: /\ba (?:bit|little)\b/i, label: '"a bit/a little"' },
  { re: /\bfairly\b|\bpretty\b|\bgenerally\b/i, label: "hedging adverbs" },
  { re: /\bmedium(?:-| )ish\b|\bish\b(?!\w)/i, label: '"-ish" values' },
  { re: /\bexperiment until\b|\bplay (?:around )?with\b/i, label: '"play with it"' },
];

function norm(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Numeric-specificity checks per guide kind. */
function numericChecks(kind: "brew" | "roast", guide: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const has = (re: RegExp) => re.test(guide);

  if (kind === "brew") {
    if (!has(/\b\d{2,3}\s*(?:°\s*)?[CF]\b/)) {
      issues.push({ code: "no-temp", severity: "block", message: "No explicit brew temperature in °C/°F." });
    }
    if (!has(/\b1\s*:\s*\d{1,2}(?:\.\d)?\b/) && !has(/\b\d{2,4}\s*g\b[\s\S]{0,60}\b\d{2,4}\s*g\b/)) {
      issues.push({ code: "no-ratio", severity: "block", message: "No brew ratio or dose/water weights in grams." });
    }
    if (!has(/\b\d{1,2}\s*:\s*\d{2}\b/) && !has(/\b\d{1,3}\s*(?:s|sec|seconds|min|minutes)\b/i)) {
      issues.push({ code: "no-time", severity: "block", message: "No timings given for the brew." });
    }
  } else {
    if (!has(/\bcharge\b[\s\S]{0,80}\d{2,3}/i)) {
      issues.push({ code: "no-charge", severity: "block", message: "No charge temperature or starting heat setting." });
    }
    if (!has(/first crack/i)) {
      issues.push({ code: "no-fc", severity: "block", message: "First crack timing is not addressed." });
    }
    if (!has(/\b\d{1,2}(?:\.\d)?\s*%/) && !has(/development(?: time)? ratio/i)) {
      issues.push({
        code: "no-dtr",
        severity: "block",
        message: "No development time ratio (as a percentage) is given.",
      });
    }
  }
  return issues;
}

/** SCA envelope sanity check on the numbers actually printed in the guide. */
function scaRangeChecks(kind: "brew" | "roast", payload: GuidePayload): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (kind !== "brew") return issues;
  const guide = payload.guide;
  const compliance = payload.scaCompliance.toLowerCase();
  const acknowledges = /outside|depart|deviat|below|above|exceeds|intentional/.test(compliance);

  const temps = [...guide.matchAll(/\b(\d{2,3})\s*(?:°\s*)?C\b/g)].map((m) => Number(m[1]));
  const brewTemps = temps.filter((t) => t >= 60 && t <= 110);
  if (brewTemps.length && !acknowledges) {
    const out = brewTemps.filter((t) => t < 90 || t > 96);
    if (out.length) {
      issues.push({
        code: "temp-range",
        severity: "warn",
        message: `Brew temperature ${out.join(", ")} °C sits outside the SCA 92-96 °C window without a stated justification.`,
      });
    }
  }

  const ratios = [...guide.matchAll(/\b1\s*:\s*(\d{1,2}(?:\.\d)?)\b/g)].map((m) => Number(m[1]));
  const filterRatios = ratios.filter((r) => r >= 5);
  if (filterRatios.length && !acknowledges) {
    const out = filterRatios.filter((r) => r < 13 || r > 20);
    if (out.length) {
      issues.push({
        code: "ratio-range",
        severity: "warn",
        message: `Brew ratio 1:${out.join(", 1:")} falls outside the Golden Cup band without a stated justification.`,
      });
    }
  }
  return issues;
}

/**
 * Deterministic SCA-compliance gate. A guide only ships when it is
 * numerically specific, states its SCA position, and every citation traces
 * back to the curated codex or a source actually fetched for this request.
 */
export function validateGuide(options: {
  kind: "brew" | "roast";
  payload: GuidePayload;
  entries: KnowledgeEntry[];
  findingUrls: string[];
  findingTitles: string[];
}): ValidationResult {
  const { kind, payload, entries, findingUrls, findingTitles } = options;
  const issues: ValidationIssue[] = [];
  const ungrounded: string[] = [];

  const guide = payload.guide?.trim() ?? "";
  if (guide.length < 300) {
    issues.push({ code: "too-short", severity: "block", message: "The guide is too thin to be usable." });
  }

  const refs = payload.references ?? [];
  if (refs.length < 5) {
    issues.push({
      code: "few-citations",
      severity: "block",
      message: `Only ${refs.length} source(s) cited; a guide needs at least 5 grounded citations.`,
    });
  }
  const types = new Set(refs.map((r) => r.type));
  if (refs.length >= 5 && types.size < 3) {
    issues.push({
      code: "narrow-sources",
      severity: "block",
      message: "Sources are too narrow; cite at least 3 different source types (standard, research, book, competition, roaster).",
    });
  }
  if (!refs.some((r) => r.type === "standard")) {
    issues.push({
      code: "no-standard",
      severity: "block",
      message: "No SCA standard or protocol is cited as the baseline.",
    });
  }

  const corpusNames = entries.map((e) => norm(e.name));
  const corpusAuthors = entries.map((e) => norm(e.author));
  const urls = new Set(findingUrls.map((u) => u.toLowerCase()));
  const titles = findingTitles.map((t) => norm(t));

  for (const ref of refs) {
    const name = norm(ref.name ?? "");
    const author = norm(ref.author ?? "");
    const url = (ref.url ?? "").toLowerCase();
    const grounded =
      corpusNames.some((n) => n.includes(name) || name.includes(n)) ||
      corpusAuthors.some((a) => a && (a === author || author.includes(a))) ||
      (url && urls.has(url)) ||
      titles.some((t) => t && (t.includes(name) || name.includes(t)));
    if (!grounded) ungrounded.push(ref.name);
  }
  if (ungrounded.length) {
    issues.push({
      code: "ungrounded",
      severity: "block",
      message: `Cited but not traceable to the codex or a fetched source: ${ungrounded.join("; ")}.`,
    });
  }

  const compliance = payload.scaCompliance?.trim() ?? "";
  if (compliance.length < 40) {
    issues.push({
      code: "no-compliance",
      severity: "block",
      message: "No SCA compliance statement for this recipe.",
    });
  }

  issues.push(...numericChecks(kind, guide));

  const vague = VAGUE_PATTERNS.filter((p) => p.re.test(guide)).map((p) => p.label);
  if (vague.length >= 2) {
    issues.push({
      code: "vague",
      severity: "block",
      message: `Advice is vague where it should be exact (${vague.join(", ")}).`,
    });
  } else if (vague.length === 1) {
    issues.push({ code: "vague", severity: "warn", message: `Vague phrasing detected (${vague[0]}).` });
  }

  issues.push(...scaRangeChecks(kind, payload));

  return {
    passed: !issues.some((i) => i.severity === "block"),
    issues,
    ungrounded,
  };
}

/** Prompt-ready correction note for a failed validation pass. */
export function renderIssues(result: ValidationResult) {
  return result.issues.map((i) => `- [${i.severity.toUpperCase()}] ${i.message}`).join("\n");
}
