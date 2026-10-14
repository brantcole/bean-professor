import { useEffect, useRef, useState } from "react";
import { Flag, Pause, Play, RotateCcw, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface Lap {
  label: string;
  at: number;
}

function format(ms: number, tenths = true) {
  const total = Math.floor(ms / 100);
  const t = total % 10;
  const s = Math.floor(total / 10) % 60;
  const m = Math.floor(total / 600);
  const base = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return tenths ? `${base}.${t}` : base;
}

/**
 * Session stopwatch for the brew and roast benches. Laps let the user mark
 * moments like pour phases, first crack, or drop without stopping the clock.
 */
export function LabStopwatch({ lapHints }: { lapHints: string[] }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const startRef = useRef(0);
  const baseRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed(baseRef.current + Date.now() - startRef.current), 100);
    return () => clearInterval(id);
  }, [running]);

  function toggle() {
    if (running) {
      baseRef.current = elapsed;
      setRunning(false);
    } else {
      startRef.current = Date.now();
      setRunning(true);
    }
  }

  function reset() {
    setRunning(false);
    baseRef.current = 0;
    setElapsed(0);
    setLaps([]);
  }

  function lap() {
    const next = lapHints[laps.length];
    setLaps((ls) => [...ls, { label: next ?? `Mark ${ls.length + 1}`, at: elapsed }]);
  }

  return (
    <section className="lab-card mt-6 p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Timer className="h-4 w-4 text-primary" />
        <span className="label-mono">Session timer</span>
      </div>

      <p
        className={cn(
          "mt-3 text-center font-mono text-5xl tabular-nums tracking-tight sm:text-6xl",
          running ? "text-foreground" : "text-muted-foreground",
        )}
        aria-live="off"
      >
        {format(elapsed)}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={toggle}
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
        </button>
        <button
          type="button"
          onClick={lap}
          disabled={elapsed === 0}
          className="flex items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-3 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-40"
        >
          <Flag className="h-4 w-4" /> Mark
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={elapsed === 0 && laps.length === 0}
          className="flex items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-3 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-40"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>

      {laps.length > 0 ? (
        <ol className="mt-4 divide-y divide-border rounded-md border border-border">
          {laps.map((l, i) => (
            <li key={i} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="text-muted-foreground">{l.label}</span>
              <span className="font-mono tabular-nums">{format(l.at, false)}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Tap Mark to log moments like {lapHints.slice(0, 3).join(", ")}…
        </p>
      )}
    </section>
  );
}
