import { askProfessorJson } from "./ai-gateway.server";
import { DEVICE_NOTES, ROASTER_NOTES } from "./coffee-types";
import type { BrewInput, RoastInput } from "./coffee-types";
import { renderKnowledge, selectKnowledge } from "./knowledge/select";
import type { GuidePayload } from "./knowledge/types";
import { renderIssues, validateGuide } from "./knowledge/validate";
import type { ValidationResult } from "./knowledge/validate";
import { renderFindings, researchSources } from "./research.server";

const HOUSE_STYLE = `You are The Bean Professor: a specialty-coffee scientist whose knowledge is the published
codex of the field — Specialty Coffee Association standards and protocols, peer-reviewed extraction/roasting
research, the reference texts, documented World Barista Championship and World Brewers Cup routines, and the
published methods of leading roasters.

Non-negotiable rules:
- SCA standards are the baseline. Any recommendation that sits outside an SCA range must be flagged and justified.
- Every number you give (ratio, temperature, time, grind guidance, charge temp, development ratio) must be
  traceable to a source in the SOURCE LIBRARY or LIVE FINDINGS you were given. Never invent a citation, a URL,
  a year, or a person's routine. Only cite sources present in the provided material.
- Draw on the breadth of the library, not one or two famous names. Cite 5-8 distinct sources from different authors and source types (standards, research, books, competition routines, roasters), preferring standards
  and research over personalities for the core numbers. Keep each contribution note to one short sentence.
- Be exact: grams, degrees, seconds, ratios, percentages. No vague advice.
- Ground flavor guidance in the origin's regional terroir and processing chemistry.
- The guide body is markdown using ONLY: '## ' section headings, '- ' bullets, '**bold**' labels, and plain
  paragraphs. Never use tables, code fences, numbered headings, or a sources list inside the body (sources are
  returned separately).
- An automated validator rejects the draft unless: 5-8 references from at least 3 different source types, at least one with type "standard" (an SCA
  standard from the library); explicit numbers (brew: °C temperature, 1:X ratio, timings; roast: charge temp,
  first-crack time, development ratio as a %); and NO vague phrasing — never write "to taste", "as needed",
  "a bit", "a little", "fairly", "pretty", "generally", "-ish", "experiment until", or "play with".
- Keep the guide body under 320 words: terse, dense, numbers over prose. No preamble. End it with one short "run the experiment" note.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["guide", "sca_compliance", "references"],
  properties: {
    guide: { type: "string", description: "The markdown guide body." },
    sca_compliance: {
      type: "string",
      description:
        "One short paragraph stating whether the recipe sits inside SCA Golden Cup / water-standard ranges and where and why it departs.",
    },
    references: {
      type: "array",
      description: "The 5-8 sources this guide actually drew on.",
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "author", "type", "year", "url", "contribution"],
        properties: {
          name: { type: "string" },
          author: { type: "string" },
          type: {
            type: "string",
            enum: ["standard", "research", "book", "competition", "roaster", "article"],
          },
          year: { type: ["string", "null"] },
          url: { type: ["string", "null"] },
          contribution: {
            type: "string",
            description:
              "Exactly what this source contributed to this guide: the parameter, the claim, and the reasoning.",
          },
        },
      },
    },
  },
} as const;

async function generate(
  kind: "brew" | "roast",
  context: string,
  queries: string[],
  taskPrompt: string,
): Promise<GuidePayload> {
  const entries = selectKnowledge({ kind, context });
  // Research is a nice-to-have: never let it hold the guide up.
  const findings = await Promise.race([
    researchSources(queries),
    new Promise<never[]>((resolve) => setTimeout(() => resolve([]), 3_500)),
  ]);

  const basePrompt = `SOURCE LIBRARY (curated, always authoritative):
${renderKnowledge(entries)}

${
  findings.length
    ? `LIVE FINDINGS (fetched just now for this specific coffee/equipment — use where credible, cite with their real URL):
${renderFindings(findings)}`
    : "LIVE FINDINGS: none available for this request. Work from the source library only."
}

TASK:
${taskPrompt}`;

  const ask = (prompt: string) =>
    askProfessorJson<{
      guide: string;
      sca_compliance: string;
      references: GuidePayload["references"];
    }>(HOUSE_STYLE, prompt, "coffee_guide", SCHEMA as unknown as Record<string, unknown>);

  let prompt = basePrompt;
  let payload: GuidePayload | null = null;
  let result: ValidationResult | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const raw = await ask(prompt);
    payload = {
      guide: raw.guide,
      scaCompliance: raw.sca_compliance,
      references: raw.references ?? [],
      researched: findings.length > 0,
    };

    result = validateGuide({
      kind,
      payload,
      entries,
      findingUrls: findings.map((f) => f.url),
      findingTitles: findings.map((f) => f.title),
    });

    if (result.passed) {
      payload.validation = {
        passed: true,
        attempts: attempt,
        warnings: result.issues.filter((i) => i.severity === "warn").map((i) => i.message),
      };
      return payload;
    }

    prompt = `${basePrompt}

COMPLIANCE REVIEW — your previous draft was REJECTED by the automated SCA compliance validator.
Fix every issue below and return a corrected guide. Do not cite any source that is not present in the
SOURCE LIBRARY or LIVE FINDINGS above, and give exact numbers everywhere.
${renderIssues(result)}`;
  }

  throw new Error(
    `The guide failed the SCA compliance check and was not shown. Unresolved: ${(result?.issues ?? [])
      .filter((i) => i.severity === "block")
      .map((i) => i.message)
      .join(" ")}`,
  );
}


export async function buildBrewGuide(input: BrewInput): Promise<GuidePayload> {
  const deviceNote = DEVICE_NOTES[input.device];
  const context = [
    input.device,
    input.origin,
    input.process,
    input.roastLevel,
    input.grinder,
    input.goal,
    input.labelNotes,
  ].join(" ");

  const taskPrompt = `Design a brew recipe.

Device: ${input.device}
${deviceNote ? `Device constraints (the recipe MUST stay inside these): ${deviceNote}\n` : ""}Coffee: ${input.origin}
Process: ${input.process}
Roast level: ${input.roastLevel}
Grinder: ${input.grinder || "unspecified"}
Water: ${input.waterProfile || "unspecified"}
Dose: ${input.doseGrams || "brewer's choice"} g
Goal: ${input.goal || "maximum clarity and sweetness"}
${input.labelNotes ? `Read from the bag/description (trust these details): ${input.labelNotes}\n` : ""}

Sections required in the guide body, in this order:
## Champion Blueprint (whose documented method and which standards this adapts, and why they suit this coffee)
## The Recipe (dose, water, ratio, temperature, grind setting guidance, total time)
## Pour Schedule (a bullet per stage with time stamps and water weights)
## What You Should Taste (regional flavor markers to expect)
## Dial-In Corrections (bullets: if sour / bitter / thin / muddy, do X)
## Run The Experiment`;

  return generate("brew", context, [
    `${input.origin} ${input.process} coffee tasting notes roaster brewing recommendation`,
    `site:sca.coffee OR site:worldcoffeeevents.org ${input.device} ${input.origin} brewing`,
    `${input.device} brew recipe technique specialty coffee ${input.roastLevel} roast`,
  ], taskPrompt);
}

export async function buildRoastGuide(input: RoastInput): Promise<GuidePayload> {
  const roasterNote = ROASTER_NOTES[input.roaster];
  const context = [
    input.roaster,
    input.origin,
    input.variety,
    input.process,
    input.density,
    input.targetProfile,
    input.goal,
    input.labelNotes,
  ].join(" ");

  const taskPrompt = `Design a roast profile.

Roaster/machine: ${input.roaster}
${roasterNote ? `Machine constraints (the profile MUST be expressed in this machine's real controls): ${roasterNote}\n` : ""}Coffee: ${input.origin}
Variety: ${input.variety || "unspecified"}
Process: ${input.process}
Bean density/moisture: ${input.density || "unspecified"}
Batch size: ${input.batchSize || "unspecified"}
Target profile: ${input.targetProfile}
Goal: ${input.goal || "bring out the origin's strongest flavor signature"}
${input.labelNotes ? `Read from the green coffee bag/spec sheet (trust these details): ${input.labelNotes}\n` : ""}

Sections required in the guide body, in this order:
## Origin Read (regional characteristics, density, and what they demand from heat)
## Roaster Blueprint (whose documented roasting philosophy and which standards this adapts, and why)
## The Profile (charge temp, turning point, drying phase, Maillard phase, first crack timing, development time ratio, drop temp)
## Heat & Airflow Moves (bullets with time stamps)
## Flavor Targets (what a correct roast should taste like, plus defects to watch for)
## Run The Experiment`;

  return generate("roast", context, [
    `${input.origin} ${input.variety} ${input.process} green coffee roast profile recommendation`,
    `site:sca.coffee OR site:worldcoffeeevents.org roasting ${input.origin} ${input.targetProfile}`,
    `${input.roaster} roast profile ${input.targetProfile} specialty coffee`,
  ], taskPrompt);
}
