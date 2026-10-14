import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Field, LabButton, LabInput, LabSelectAddable, LabTextarea } from "@/components/LabField";
import { GuideResult } from "@/components/GuideResult";
import { LabelScanner, type LabelReading } from "@/components/LabelScanner";
import { LabStopwatch } from "@/components/LabStopwatch";
import { generateBrewGuide } from "@/lib/coffee.functions";
import {
  BREW_DEVICES,
  ORIGINS,
  PROCESSES,
  ROAST_LEVELS,
  matchOption,
  summarizeLabel,
} from "@/lib/coffee-types";
import type { BrewInput } from "@/lib/coffee-types";
import type { GuidePayload } from "@/lib/knowledge/types";


export const Route = createFileRoute("/brew")({
  head: () => ({
    meta: [
      { title: "Brew Lab — Champion Recipes for Your Gear | The Bean Professor" },
      {
        name: "description",
        content:
          "Build a brew recipe from world barista champion methods, matched to your brewer, grinder, water and your coffee's origin and process.",
      },
      { property: "og:title", content: "Brew Lab — The Bean Professor" },
      {
        property: "og:description",
        content: "Champion-method brew recipes tailored to your device and your beans.",
      },
    ],
  }),
  component: BrewPage,
});

const defaults: BrewInput = {
  device: BREW_DEVICES[0]!,
  origin: ORIGINS[0]!,
  process: PROCESSES[0]!,
  roastLevel: ROAST_LEVELS[0]!,
  grinder: "",
  waterProfile: "",
  doseGrams: "18",
  goal: "",
  labelNotes: "",
};

function BrewPage() {
  const generate = useServerFn(generateBrewGuide);
  const [form, setForm] = useState<BrewInput>(defaults);
  const [origins, setOrigins] = useState<string[]>([...ORIGINS]);
  const [result, setResult] = useState<GuidePayload | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof BrewInput) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  function applyReading(reading: LabelReading) {
    const scannedOrigin = reading.origin || reading.coffeeName;
    if (scannedOrigin) {
      setOrigins((list) => (list.includes(scannedOrigin) ? list : [scannedOrigin, ...list]));
    }
    setForm((f) => ({
      ...f,
      origin: scannedOrigin || f.origin,
      process: matchOption(PROCESSES, reading.process) || f.process,
      roastLevel: matchOption(ROAST_LEVELS, reading.roastLevel) || f.roastLevel,
      labelNotes: summarizeLabel(reading),
    }));
  }

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      setResult(await generate({ data: form }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The lab could not run that experiment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell backdrop>
      <header className="pt-2">
        <span className="label-mono">Bench 01</span>
        <h1 className="mt-2 flex items-center gap-3 font-display text-3xl sm:text-4xl">
          <FlaskConical className="h-7 w-7 text-primary" /> Brew Lab
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Scan your bag or describe your setup. The Professor writes the recipe.
        </p>
      </header>

      <LabelScanner mode="brew" onRead={applyReading} />

      <section className="lab-card mt-6 space-y-4 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brewing device">
            <LabSelectAddable
              options={BREW_DEVICES}
              value={form.device}
              onChange={set("device")}
            />
          </Field>
          <Field label="Coffee / origin">
            <LabSelectAddable
              options={origins}
              value={form.origin}
              onChange={set("origin")}
            />
          </Field>

          <Field label="Process">
            <LabSelectAddable
              options={PROCESSES}
              value={form.process}
              onChange={set("process")}
            />
          </Field>
          <Field label="Roast level">
            <LabSelectAddable
              options={ROAST_LEVELS}
              value={form.roastLevel}
              onChange={set("roastLevel")}
            />
          </Field>
          <Field label="Grinder" hint="optional">
            <LabInput
              value={form.grinder}
              maxLength={80}
              placeholder="Comandante C40, Ode Gen 2…"
              onChange={(e) => set("grinder")(e.target.value)}
            />
          </Field>
          <Field label="Water" hint="optional">
            <LabInput
              value={form.waterProfile}
              maxLength={120}
              placeholder="Third Wave Water, 120 ppm…"
              onChange={(e) => set("waterProfile")(e.target.value)}
            />
          </Field>
          <Field label="Dose (g)">
            <LabInput
              value={form.doseGrams}
              maxLength={20}
              inputMode="decimal"
              onChange={(e) => set("doseGrams")(e.target.value)}
            />
          </Field>
        </div>

        <Field label="What are you chasing?" hint="optional">
          <LabTextarea
            value={form.goal}
            maxLength={400}
            placeholder="More florals and less astringency; sweeter body for a milk drink…"
            onChange={(e) => set("goal")(e.target.value)}
          />
        </Field>

        <LabButton onClick={run} disabled={loading} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Consulting the champions…" : "Design my brew"}
        </LabButton>
      </section>

      <LabStopwatch
        lapHints={["Bloom", "First pour", "Second pour", "Final pour", "Drawdown"]}
      />

      {result ? (
        <GuideResult
          kind="brew"
          title={`${form.device} · ${form.origin}`}
          inputs={{ ...form }}
          payload={result}
        />
      ) : null}
    </AppShell>
  );
}
