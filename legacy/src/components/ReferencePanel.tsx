import { useState } from "react";
import { ChevronDown, BookOpen, ExternalLink, ShieldCheck, TriangleAlert } from "lucide-react";
import type { GuideReference, GuideValidation } from "@/lib/knowledge/types";

const TYPE_LABEL: Record<string, string> = {
  standard: "SCA standard",
  research: "Research",
  book: "Reference text",
  competition: "Competition",
  roaster: "Roaster method",
  article: "Article",
};

export function ReferencePanel({
  references,
  scaCompliance,
  researched,
  validation,
}: {
  references: GuideReference[];
  scaCompliance?: string;
  researched?: boolean;
  validation?: GuideValidation | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!references.length && !scaCompliance) return null;

  return (
    <div className="mt-8 border-t border-border pt-5">
      {validation?.passed ? (
        <p className="label-mono mb-3 inline-flex items-center gap-2 rounded border border-accent/40 bg-accent/10 px-2 py-1 text-accent">
          <ShieldCheck className="h-3.5 w-3.5" />
          SCA validator passed
          {validation.attempts > 1 ? ` · ${validation.attempts} passes` : ""}
        </p>
      ) : null}

      {validation?.warnings?.length ? (
        <ul className="mb-4 space-y-1.5">
          {validation.warnings.map((w, i) => (
            <li key={i} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-copper" />
              <span>{w}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {scaCompliance ? (
        <p className="mb-4 flex gap-3 rounded-md border border-border/70 bg-background/40 p-3 text-sm leading-relaxed text-foreground/90">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <span>
            <span className="label-mono mr-2 text-accent">SCA check</span>
            {scaCompliance}
          </span>
        </p>
      ) : null}


      {references.length ? (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="label-mono">References · {references.length}</span>
            </span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open ? (
            <ul className="mt-3 space-y-2">
              {references.map((ref, i) => {
                const isOpen = expanded === i;
                return (
                  <li key={i} className="rounded-md border border-border/70 bg-background/30">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : i)}
                      className="flex w-full items-start gap-3 p-3 text-left"
                    >
                      <span className="label-mono mt-0.5 shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {TYPE_LABEL[ref.type] ?? ref.type}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground">{ref.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {ref.author}
                          {ref.year ? ` · ${ref.year}` : ""}
                        </span>
                      </span>
                      <ChevronDown
                        className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen ? (
                      <div className="border-t border-border/60 px-3 py-3">
                        <p className="text-sm leading-relaxed text-foreground/90">{ref.contribution}</p>
                        {ref.url ? (
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="mt-2 inline-flex items-center gap-1.5 text-xs text-accent underline underline-offset-4"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View source
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : null}

          <p className="mt-3 text-xs text-muted-foreground">
            {researched
              ? "Grounded in the curated SCA/expert codex plus sources looked up for this coffee."
              : "Grounded in the curated SCA/expert codex."}
          </p>
        </>
      ) : null}
    </div>
  );
}
