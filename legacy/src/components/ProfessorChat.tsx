import { useEffect, useRef, useState } from "react";
import { Loader2, MessagesSquare, Send, Square } from "lucide-react";
import { LabMarkdown } from "./LabMarkdown";
import type { GuideReference } from "@/lib/knowledge/types";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ProfessorChatContext = {
  kind: "brew" | "roast" | "learn";
  title: string;
  inputs: Record<string, string>;
  guide: string;
  scaCompliance: string;
  references: GuideReference[];
};

const STARTERS = {
  brew: ["Why this ratio and temperature?", "My cup tastes sour — what should I change?", "How would a champion tweak this?"],
  roast: ["Walk me through the profile settings", "My last roast tasted baked — why?", "How do I push more sweetness?"],
  learn: ["Teach me something new about coffee", "Where did coffee come from?", "What does the SCA actually do?", "Why does altitude matter for flavor?", "Washed vs natural — what's the difference?"],
};

export function ProfessorChat({
  context,
  initialMessages = [],
  onMessagesChange,
}: {
  context: ProfessorChatContext;
  initialMessages?: ChatMessage[];
  onMessagesChange?: (messages: ChatMessage[]) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    setError(null);
    setInput("");
    const history: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    let reply = "";
    try {
      const res = await fetch("/api/professor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          context: {
            ...context,
            references: context.references.map(({ name, author, type, contribution }) => ({
              name,
              author,
              type,
              contribution,
            })),
          },
          messages: history.slice(-30),
        }),
      });
      if (!res.ok || !res.body) throw new Error((await res.text()) || "The Professor couldn't answer.");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: reply }]);
      }
    } catch (e) {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
      abortRef.current = null;
      const final = reply.trim() ? [...history, { role: "assistant" as const, content: reply }] : history;
      setMessages(final);
      onMessagesChange?.(final);
    }
  }

  return (
    <div className={context.kind === "learn" ? "" : "mt-8 border-t border-border pt-5"}>
      <span className="label-mono flex items-center gap-2">
        <MessagesSquare className="h-4 w-4 text-primary" /> Ask the Professor
      </span>
      <p className="mt-1 text-xs text-muted-foreground">
        {context.kind === "learn"
          ? "Origins, history, science, the SCA — ask anything about coffee. Answers cite real sources."
          : "Explain, troubleshoot or refine this guide — answers cite the same SCA & expert sources."}
      </p>

      {messages.length ? (
        <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="ml-8 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
                {m.content}
              </div>
            ) : (
              <div key={i} className="mr-4 text-sm">
                {m.content ? (
                  <LabMarkdown text={m.content} />
                ) : (
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Consulting the codex…
                  </span>
                )}
              </div>
            ),
          )}
          <div ref={endRef} />
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {STARTERS[context.kind].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="rounded-full border border-border bg-background/40 px-3 py-1.5 text-xs text-foreground/90 hover:border-primary"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {error ? <p className="mt-3 text-xs text-destructive">{error}</p> : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-3 flex items-end gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={2}
          maxLength={2000}
          placeholder={context.kind === "learn" ? "Ask anything about coffee…" : "Ask about this recipe…"}
          className="min-h-[44px] flex-1 resize-none rounded-md border border-border bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        {busy ? (
          <button
            type="button"
            aria-label="Stop"
            onClick={() => abortRef.current?.abort()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border text-foreground"
          >
            <Square className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            aria-label="Send"
            disabled={!input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </form>
    </div>
  );
}
