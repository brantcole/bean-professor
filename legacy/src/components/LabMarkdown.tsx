type Props = { text: string };

/** Minimal markdown renderer for the guide format the Professor returns. */
export function LabMarkdown({ text }: Props) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];

  const flushList = (key: string) => {
    if (!list.length) return;
    blocks.push(
      <ul key={key} className="my-3 space-y-2">
        {list.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/90">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span>{inline(item)}</span>
          </li>
        ))}
      </ul>,
    );
    list = [];
  };

  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (line.startsWith("- ") || line.startsWith("* ")) {
      list.push(line.slice(2));
      return;
    }
    flushList(`l-${index}`);
    if (!line) return;
    if (line.startsWith("## ") || line.startsWith("### ")) {
      blocks.push(
        <h3
          key={index}
          className="mt-7 flex items-center gap-3 font-display text-lg text-primary first:mt-0"
        >
          <span className="label-mono text-primary/70">{String(blocks.length + 1).padStart(2, "0")}</span>
          {line.replace(/^#+\s*/, "")}
        </h3>,
      );
      return;
    }
    blocks.push(
      <p key={index} className="my-2 text-sm leading-relaxed text-foreground/90">
        {inline(line)}
      </p>,
    );
  });
  flushList("l-final");

  return <div>{blocks}</div>;
}

function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}
