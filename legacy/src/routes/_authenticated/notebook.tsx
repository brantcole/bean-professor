import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FlaskConical, Flame, Loader2, Star, Trash2, NotebookPen } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { LabMarkdown } from "@/components/LabMarkdown";
import { ReferencePanel } from "@/components/ReferencePanel";
import { ProfessorChat, type ChatMessage } from "@/components/ProfessorChat";
import type { GuideReference } from "@/lib/knowledge/types";
import { LabButton, LabTextarea } from "@/components/LabField";
import { deleteSession, listSessions, updateSession } from "@/lib/coffee.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notebook")({
  head: () => ({
    meta: [
      { title: "Lab Notebook — Your Brew & Roast Sessions | The Bean Professor" },
      {
        name: "description",
        content:
          "Every brewing and roasting session you saved, with the recipe, your tasting notes and your rating.",
      },
      { property: "og:title", content: "Lab Notebook — The Bean Professor" },
      {
        property: "og:description",
        content: "Your saved brew and roast sessions, notes and ratings.",
      },
    ],
  }),
  component: Notebook,
});

function Notebook() {
  const fetchSessions = useServerFn(listSessions);
  const { data, isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => fetchSessions(),
  });

  return (
    <AppShell backdrop>
      <header className="pt-2">
        <span className="label-mono">Archive</span>
        <h1 className="mt-2 flex items-center gap-3 font-display text-3xl sm:text-4xl">
          <NotebookPen className="h-7 w-7 text-accent" /> Lab Notebook
        </h1>
      </header>

      {isLoading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : !data?.length ? (
        <div className="lab-card mt-6 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No sessions filed yet. Run an experiment and save it.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/brew"
              className="rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              Brew Lab
            </Link>
            <Link
              to="/roast"
              className="rounded-md border border-border px-4 py-3 text-sm font-semibold text-muted-foreground"
            >
              Roast Lab
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {data.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

type SessionRow = {
  id: string;
  kind: string;
  title: string;
  recommendation: string | null;
  notes: string | null;
  rating: number | null;
  created_at: string;
  sca_compliance?: string | null;
  references_json?: unknown;
  chat_json?: unknown;
  inputs?: unknown;
};

function SessionCard({ session }: { session: SessionRow }) {
  const queryClient = useQueryClient();
  const update = useServerFn(updateSession);
  const remove = useServerFn(deleteSession);
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(session.notes ?? "");

  const saveNotes = useMutation({
    mutationFn: () => update({ data: { id: session.id, notes } }),
    onSuccess: () => {
      toast.success("Notes updated");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: () => toast.error("Could not update notes"),
  });

  const setRating = useMutation({
    mutationFn: (rating: number) => update({ data: { id: session.id, rating } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions"] }),
  });

  const destroy = useMutation({
    mutationFn: () => remove({ data: { id: session.id } }),
    onSuccess: () => {
      toast.success("Session removed");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const Icon = session.kind === "brew" ? FlaskConical : Flame;

  return (
    <article className="lab-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="label-mono flex items-center gap-2">
            <Icon className={cn("h-3.5 w-3.5", session.kind === "brew" ? "text-primary" : "text-copper")} />
            {session.kind === "brew" ? "Brew session" : "Roast session"} ·{" "}
            {new Date(session.created_at).toLocaleDateString()}
          </span>
          <h2 className="mt-1.5 truncate font-display text-lg">{session.title}</h2>
        </div>
        <button
          onClick={() => destroy.mutate()}
          aria-label="Delete session"
          className="rounded-md p-2 text-muted-foreground transition hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            aria-label={`Rate ${value}`}
            onClick={() => setRating.mutate(value)}
            className="p-0.5"
          >
            <Star
              className={cn(
                "h-4 w-4",
                (session.rating ?? 0) >= value ? "fill-primary text-primary" : "text-muted-foreground",
              )}
            />
          </button>
        ))}
      </div>

      <LabTextarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxLength={8000}
        placeholder="Tasting notes, adjustments, results…"
        className="mt-4"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <LabButton
          onClick={() => saveNotes.mutate()}
          disabled={saveNotes.isPending || notes === (session.notes ?? "")}
          className="px-3 py-2 text-xs"
        >
          Save notes
        </LabButton>
        <LabButton variant="ghost" onClick={() => setOpen((v) => !v)} className="px-3 py-2 text-xs">
          {open ? "Hide recipe" : "Show recipe"}
        </LabButton>
      </div>

      {open && session.recommendation ? (
        <div className="mt-4 border-t border-border pt-4">
          <LabMarkdown text={session.recommendation} />
          <ReferencePanel
            references={(Array.isArray(session.references_json) ? session.references_json : []) as GuideReference[]}
            scaCompliance={session.sca_compliance ?? ""}
          />
          <ProfessorChat
            context={{
              kind: session.kind === "roast" ? "roast" : "brew",
              title: session.title,
              inputs: (session.inputs && typeof session.inputs === "object" ? session.inputs : {}) as Record<string, string>,
              guide: session.recommendation,
              scaCompliance: session.sca_compliance ?? "",
              references: (Array.isArray(session.references_json) ? session.references_json : []) as GuideReference[],
            }}
            initialMessages={(Array.isArray(session.chat_json) ? session.chat_json : []) as ChatMessage[]}
            onMessagesChange={(chat) => {
              update({ data: { id: session.id, chat } }).catch(() => toast.error("Could not save the chat"));
            }}
          />
        </div>
      ) : null}
    </article>
  );
}
