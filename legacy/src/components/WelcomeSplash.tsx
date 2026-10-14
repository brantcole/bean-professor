import { useEffect, useState } from "react";
import { COFFEE_FACTS } from "@/lib/coffee-facts";

const SESSION_KEY = "bean-professor:welcomed";

export function WelcomeSplash() {
  const [fact, setFact] = useState<(typeof COFFEE_FACTS)[number] | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // sessionStorage unavailable — still show the welcome once per mount
    }
    setFact(COFFEE_FACTS[Math.floor(Math.random() * COFFEE_FACTS.length)]!);
  }, []);

  useEffect(() => {
    if (!fact) return;
    const dismiss = () => setLeaving(true);
    window.addEventListener("pointerdown", dismiss, { once: true });
    window.addEventListener("keydown", dismiss, { once: true });
    return () => {
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("keydown", dismiss);
    };
  }, [fact]);

  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => setFact(null), 700);
    return () => window.clearTimeout(t);
  }, [leaving]);

  if (!fact) return null;

  return (
    <div
      role="dialog"
      aria-label="Welcome"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background/95 px-6 backdrop-blur-xl transition-opacity duration-700 ease-out ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="mx-auto max-w-md text-center animate-fade-in">
        <span className="label-mono">{fact.category}</span>
        <p className="mt-4 font-display text-2xl leading-snug text-foreground sm:text-3xl">
          {fact.text}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">{fact.source}</p>
        <p className="mt-10 text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground/80">
          Tap anywhere to enter the lab
        </p>
      </div>
    </div>
  );
}
