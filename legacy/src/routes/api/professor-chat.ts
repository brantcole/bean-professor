import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  context: z.object({
    kind: z.enum(["brew", "roast", "learn"]),
    title: z.string().max(200),
    inputs: z.record(z.string(), z.string().max(1500)),
    guide: z.string().max(20000).default(""),
    scaCompliance: z.string().max(4000).default(""),
    references: z
      .array(
        z.object({
          name: z.string().max(300),
          author: z.string().max(200),
          type: z.string().max(40),
          contribution: z.string().max(2000),
        }),
      )
      .max(40)
      .default([]),
  }),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(6000) }))
    .min(1)
    .max(60),
});

export const Route = createFileRoute("/api/professor-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return new Response("Invalid chat request", { status: 400 });
        }
        const { streamProfessorChat } = await import("@/lib/professor-chat.server");
        try {
          return await streamProfessorChat(parsed.context, parsed.messages, request.signal);
        } catch (error) {
          if (request.signal.aborted) return new Response(null, { status: 499 });
          console.error("Professor chat error:", error);
          return new Response("The Professor couldn't answer right now.", { status: 500 });
        }
      },
    },
  },
});
