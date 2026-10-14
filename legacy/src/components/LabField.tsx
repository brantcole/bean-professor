import { useState } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label-mono">{label}</span>
      {hint ? <span className="label-mono ml-2 text-muted-foreground/60">{hint}</span> : null}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const baseControl =
  "w-full rounded-md border border-input bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25";

export function LabSelect({
  options,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: readonly string[] }) {
  return (
    <select {...props} className={cn(baseControl, className)}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export function LabInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(baseControl, className)} />;
}

export function LabTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(baseControl, "min-h-24 resize-y", className)} />;
}

export function LabButton({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold transition disabled:opacity-50",
        variant === "primary"
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "border border-border text-muted-foreground hover:text-foreground",
        className,
      )}
    />
  );
}

const ADD_SENTINEL = "__add_custom__";

/**
 * Select that lets the user add an option of their own when the list
 * doesn't cover their gear or coffee.
 */
export function LabSelectAddable({
  options,
  value,
  onChange,
  addLabel = "+ Add my own…",
  placeholder = "Type your own…",
}: {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  addLabel?: string;
  placeholder?: string;
}) {
  const [custom, setCustom] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const all = [...options, ...custom.filter((c) => !options.includes(c))];
  const list = value && !all.includes(value) ? [value, ...all] : all;

  function commit() {
    const next = draft.trim();
    if (!next) {
      setAdding(false);
      return;
    }
    setCustom((c) => (c.includes(next) ? c : [...c, next]));
    onChange(next);
    setDraft("");
    setAdding(false);
  }

  return (
    <div className="space-y-2">
      <select
        value={value}
        onChange={(e) => {
          if (e.target.value === ADD_SENTINEL) {
            setAdding(true);
            return;
          }
          onChange(e.target.value);
        }}
        className={baseControl}
      >
        {list.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        <option value={ADD_SENTINEL}>{addLabel}</option>
      </select>

      {adding ? (
        <div className="flex gap-2">
          <LabInput
            autoFocus
            value={draft}
            maxLength={120}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
              if (e.key === "Escape") setAdding(false);
            }}
          />
          <LabButton type="button" onClick={commit} className="shrink-0 px-4 py-2">
            Add
          </LabButton>
        </div>
      ) : null}
    </div>
  );
}
