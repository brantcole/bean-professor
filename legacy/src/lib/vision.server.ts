/**
 * Reads a coffee bag label / web description screenshot and extracts the
 * facts the Brew and Roast labs need. Uses a multimodal model through the
 * Lovable AI Gateway chat-completions endpoint.
 */
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const VISION_MODEL = "google/gemini-3.6-flash";

export type LabelReading = {
  coffeeName: string;
  origin: string;
  region: string;
  producer: string;
  variety: string;
  process: string;
  roastLevel: string;
  elevation: string;
  flavorNotes: string;
  roastDate: string;
  isGreen: boolean;
  summary: string;
  confidence: "high" | "medium" | "low";
};

const EMPTY: LabelReading = {
  coffeeName: "",
  origin: "",
  region: "",
  producer: "",
  variety: "",
  process: "",
  roastLevel: "",
  elevation: "",
  flavorNotes: "",
  roastDate: "",
  isGreen: false,
  summary: "",
  confidence: "low",
};

const SYSTEM = `You are The Bean Professor's label reader. You are shown a photo of a coffee bag,
a bag of green coffee, or a screenshot of a roaster's web description. Read every legible detail and
return ONLY a JSON object (no prose, no code fences) with these keys:

coffeeName, origin, region, producer, variety, process, roastLevel, elevation, flavorNotes,
roastDate, isGreen, summary, confidence.

Rules:
- "origin" is the country plus growing region when known, e.g. "Ethiopia — Yirgacheffe".
- "process" is one of Washed, Natural, Honey, Anaerobic, Wet-hulled, Carbonic maceration, or the
  exact wording on the label if it is something else. Empty string if not stated.
- "roastLevel" is one of Light / Nordic, Light-medium, Medium, Medium-dark, Dark, or "" if unstated
  or if the coffee is unroasted green coffee.
- "isGreen" is true only when the label clearly describes unroasted/green coffee.
- "flavorNotes" is a comma-separated list of the tasting notes printed on the label.
- "summary" is one or two sentences of anything else useful (lot name, altitude, cupping score,
  brewing suggestions printed by the roaster).
- "confidence" reflects how legible the image was.
- Never invent facts that are not visible. Use "" for anything you cannot read.`;

export async function readCoffeeLabel(imageDataUrl: string): Promise<LabelReading> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: "Read this coffee label or description and return the JSON." },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("The lab is busy right now — try that scan again shortly.");
    if (res.status === 402) throw new Error("AI credits are exhausted. Add credits to keep the lab running.");
    throw new Error(`Label scan failed (${res.status}): ${detail.slice(0, 200)}`);
  }

  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const raw = json.choices?.[0]?.message?.content ?? "";
  return parseReading(raw);
}

function parseReading(raw: string): LabelReading {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("The Professor could not read that image. Try a sharper, closer photo.");
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    throw new Error("The Professor could not read that image. Try a sharper, closer photo.");
  }

  const str = (key: keyof LabelReading) => {
    const value = parsed[key];
    return typeof value === "string" ? value.slice(0, 300).trim() : "";
  };

  const confidence = str("confidence").toLowerCase();

  return {
    ...EMPTY,
    coffeeName: str("coffeeName"),
    origin: str("origin"),
    region: str("region"),
    producer: str("producer"),
    variety: str("variety"),
    process: str("process"),
    roastLevel: str("roastLevel"),
    elevation: str("elevation"),
    flavorNotes: str("flavorNotes"),
    roastDate: str("roastDate"),
    isGreen: parsed["isGreen"] === true,
    summary: str("summary"),
    confidence: confidence === "high" || confidence === "medium" ? confidence : "low",
  };
}
