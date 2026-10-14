/**
 * Lovable AI Gateway helper.
 *
 * Guides use a fast chat model (streamed, accumulated server-side) so a full
 * generation lands in a couple of seconds instead of a minute of reasoning.
 */
const CHAT_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const FAST_MODEL = "google/gemini-3.1-flash-lite";

type ChatBody = Record<string, unknown>;

function gatewayError(status: number, detail: string) {
  if (status === 429) return new Error("The lab is busy right now — please try again in a moment.");
  if (status === 402) return new Error("AI credits are exhausted. Add credits to keep the lab running.");
  return new Error(`AI request failed (${status}): ${detail.slice(0, 300)}`);
}

async function runChat(body: ChatBody): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

  const res = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({ model: FAST_MODEL, stream: true, ...body }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw gatewayError(res.status, detail);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const event = JSON.parse(payload) as {
          choices?: { delta?: { content?: string }; message?: { content?: string } }[];
        };
        const choice = event.choices?.[0];
        const delta = choice?.delta?.content ?? choice?.message?.content;
        if (typeof delta === "string") text += delta;
      } catch {
        // ignore malformed keepalive chunks
      }
    }
  }

  return text.trim();
}

export async function askProfessor(system: string, prompt: string): Promise<string> {
  return runChat({
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
  });
}

/**
 * Ask for a strict JSON object back. `schema` must be strict-compatible:
 * object root, every property required, additionalProperties false.
 */
export async function askProfessorJson<T>(
  system: string,
  prompt: string,
  schemaName: string,
  schema: Record<string, unknown>,
): Promise<T> {
  const raw = await runChat({
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: schemaName, strict: true, schema },
    },
  });

  try {
    return JSON.parse(raw) as T;
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1)) as T;
    throw new Error("The Professor returned an unreadable answer. Please try again.");
  }
}
