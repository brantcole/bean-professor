import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Flame } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Field, LabButton, LabInput, LabSelectAddable, LabTextarea } from "@/components/LabField";
import { GuideResult } from "@/components/GuideResult";
import { LabelScanner, type LabelReading } from "@/components/LabelScanner";
import { LabStopwatch } from "@/components/LabStopwatch";
import { generateRoastGuide } from "@/lib/coffee.functions";
import {
  ORIGINS,
  PROCESSES,
  ROAST_MACHINES,
  TARGET_PROFILES,
  matchOption,
  summarizeLabel,
} from "@/lib/coffee-types";
import type { RoastInput } from "@/lib/coffee-types";
import type { GuidePayload } from "@/lib/knowledge/types";

export const Route = createFileRoute("/roast")({
  head: () => ({
    meta: [
      { title: "Roast Lab — Profiles from the World's Best Roasters | The Bean Professor" },
      {
        name: "description",
        content:
          "Build a roast profile with charge temperature, phase timings and development ratio, tuned to your target profile and your beans' origin and density.",
      },
      { property: "og:title", content: "Roast Lab — The Bean Professor" },
      {
        property: "og:description",
        content: "Roast profiles from top roasters, tuned to your beans' origin and your target.",
      },
    ],
  }),
  component: RoastPage,
});

const defaults: RoastInput = {
  roaster: ROAST_MACHINES[0]!,
  origin: ORIGINS[0]!,
  variety: "",
  process: PROCESSES[0]!,
  density: "",
  batchSize: "",
  targetProfile: TARGET_PROFILES[0]!,
  goal: "",
  labelNotes: "",
};

function RoastPage() {
  const generate = useServerFn(generateRoastGuide);
  const [form, setForm] = useState<RoastInput>(defaults);
  const [origins, setOrigins] = useState<string[]>([...ORIGINS]);
  const [result, setResult] = useState<GuidePayload | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof RoastInput) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  function applyReading(reading: LabelReading) {
    const scannedOrigin = reading.origin || reading.coffeeName;
    if (scannedOrigin) {
      setOrigins((list) => (list.includes(scannedOrigin) ? list : [scannedOrigin, ...list]));
    }
    setForm((f) => ({
      ...f,
      origin: scannedOrigin || f.origin,
      variety: reading.variety || f.variety,
      process: matchOption(PROCESSES, reading.process) || f.process,
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
        <span className="label-mono">Bench 02</span>
        <h1 className="mt-2 flex items-center gap-3 font-display text-3xl sm:text-4xl">
          <Flame className="h-7 w-7 text-copper" /> Roast Lab
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Scan your green coffee, set your machine, and pick the profile you're aiming for.
        </p>
      </header>

      <LabelScanner mode="roast" onRead={applyReading} />

      <section className="lab-card mt-6 space-y-4 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Roaster / machine">
            <LabSelectAddable
              options={ROAST_MACHINES}
              value={form.roaster}
              onChange={set("roaster")}
            />
          </Field>
          <Field label="Green coffee origin">
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
          <Field label="Target profile">
            <LabSelectAddable
              options={TARGET_PROFILES}
              value={form.targetProfile}
              onChange={set("targetProfile")}
            />
          </Field>
          <Field label="Variety" hint="optional">
            <LabInput
              value={form.variety}
              maxLength={80}
              placeholder="Heirloom, SL28, Caturra…"
              onChange={(e) => set("variety")(e.target.value)}
            />
          </Field>
          <Field label="Density / moisture" hint="optional">
            <LabInput
              value={form.density}
              maxLength={80}
              placeholder="0.72 g/ml, 10.5% moisture"
              onChange={(e) => set("density")(e.target.value)}
            />
          </Field>
          <Field label="Batch size" hint="optional">
            <LabInput
              value={form.batchSize}
              maxLength={40}
              placeholder="450 g"
              onChange={(e) => set("batchSize")(e.target.value)}
            />
          </Field>
        </div>

        <Field label="What flavor are you trying to pull out?" hint="optional">
          <LabTextarea
            value={form.goal}
            maxLength={400}
            placeholder="Jammy berry without baking it; more sweetness, less grassiness…"
            onChange={(e) => set("goal")(e.target.value)}
          />
        </Field>

        <LabButton onClick={run} disabled={loading} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Modeling the curve…" : "Design my roast"}
        </LabButton>
      </section>

      <LabStopwatch
        lapHints={["Charge", "Turning point", "Yellowing", "First crack", "Drop / Cool"]}
      />

      {result ? (
        <GuideResult
          kind="roast"
          title={`${form.origin} · ${form.targetProfile}`}
          inputs={{ ...form }}
          payload={result}
        />
      ) : null}
    </AppShell>
  );
}
