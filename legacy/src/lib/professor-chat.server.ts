import { renderKnowledge, selectKnowledge } from "./knowledge/select";

const RESPONSES_URL = "https://ai.gateway.lovable.dev/v1/responses";
const CHAT_MODEL = "openai/gpt-6-astra";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type ChatContext = {
  kind: "brew" | "roast" | "learn";
  title: string;
  inputs: Record<string, string>;
  guide: string;
  scaCompliance: string;
  references: { name: string; author: string; type: string; contribution: string }[];
};

const GROUNDING_RULES = `Rules:
- Ground every claim and number in the SOURCE LIBRARY below; name the source inline ("per SCA Golden Cup…", "Rao's Roaster's Companion…"). Never invent a source, URL, year or person's routine. If nothing in the material covers a question, say so plainly and give your best reasoning labelled as such.
- SCA standards are the baseline; flag any suggestion outside SCA ranges and justify it.
- Be concise and conversational: short paragraphs or bullets, exact numbers (g, °C, s, ratios). Suggest one change at a time when troubleshooting.`;

function systemPrompt(ctx: ChatContext, question: string) {
  const entries = selectKnowledge({
    kind: ctx.kind,
    context: `${Object.values(ctx.inputs).join(" ")} ${ctx.title} ${question}`,
    limit: 30,
  });

  if (ctx.kind === "learn") {
    return `You are The Bean Professor, a specialty-coffee scientist and educator. The user is exploring coffee — its origins, history, geography and terroir, processing, brewing, roasting, the science behind it, and the Specialty Coffee Association (SCA) and its standards. Teach clearly and enthusiastically, like a great professor office-hours chat.

${GROUNDING_RULES}
- Pitch answers at a curious home enthusiast: define jargon when you use it, and connect facts to what they can taste or try at home.

SOURCE LIBRARY:
${renderKnowledge(entries)}`;
  }

  const refs = ctx.references
    .map((r) => `- ${r.name} — ${r.author} (${r.type}): ${r.contribution}`)
    .join("\n");

  return `You are The Bean Professor, a specialty-coffee scientist talking with a home ${
    ctx.kind === "brew" ? "brewer" : "roaster"
  } about the ${ctx.kind} guide below. Help them understand it, brainstorm, troubleshoot and refine it.

${GROUNDING_RULES}
- Respect the user's actual equipment. For an original Behmor 1600, settings are locked once Start is pressed — only pre-roast choices and hitting Cool early are possible.

GUIDE (${ctx.title}):
Inputs: ${JSON.stringify(ctx.inputs)}
${ctx.guide}

SCA CHECK: ${ctx.scaCompliance}

GUIDE REFERENCES:
${refs || "(none)"}

SOURCE LIBRARY:
${renderKnowledge(entries)}`;
}

export async function streamProfessorChat(
  ctx: ChatContext,
  messages: ChatTurn[],
  signal: AbortSignal,
): Promise<Response> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return new Response("The Professor is not configured.", { status: 500 });

  const upstream = await fetch(RESPONSES_URL, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      instructions: systemPrompt(ctx, messages[messages.length - 1]?.content ?? ""),
      input: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
      store: false,
      reasoning: { effort: "low" },
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    console.error(`Professor chat failed [${upstream.status}]: ${detail.slice(0, 400)}`);
    const msg =
      upstream.status === 429
        ? "The lab is busy — try again in a moment."
        : upstream.status === 402
          ? "AI credits are exhausted. Add credits to keep chatting."
          : `The Professor couldn't answer (${upstream.status}).`;
    return new Response(msg, { status: upstream.status });
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        let emitted = false;
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith("data:")) continue;
          const payload = t.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const ev = JSON.parse(payload) as { type?: string; delta?: string };
            if (ev.type === "response.output_text.delta" && typeof ev.delta === "string") {
              controller.enqueue(encoder.encode(ev.delta));
              emitted = true;
            }
          } catch {
            // ignore keepalives
          }
        }
        if (emitted) return;
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  const headers = new Headers({ "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" });
  upstream.headers.forEach((v, k) => {
    if (k.toLowerCase().startsWith("x-lovable-aig-")) headers.set(k, v);
  });
  return new Response(stream, { headers });
}
