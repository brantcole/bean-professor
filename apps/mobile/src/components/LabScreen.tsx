import { useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  elapsedTime,
  mockBrewGuide,
  mockRoastGuide,
  validateBrewInput,
  validateRoastInput,
  type BrewInputs,
  type LabKind,
  type MockGuide,
  type RoastInputs,
} from "@bean-professor/domain";
import { defaultBrew, defaultRoast } from "../data/fixtures";
import { clock, newId, useDemo } from "../state/DemoProvider";
import { Button, Card, Chip, colors, Field, Message, Screen, ui } from "./ui";
import { LabTimer } from "./LabTimer";

const brewFields = [
  ["coffeeName", "Coffee name"],
  ["origin", "Origin"],
  ["process", "Process"],
  ["roastLevel", "Roast level"],
  ["grinder", "Grinder"],
  ["water", "Water"],
  ["dose", "Dose (g)"],
  ["goal", "Your sensory goal"],
] as const;
const roastFields = [
  ["coffeeName", "Coffee name"],
  ["origin", "Origin"],
  ["variety", "Variety"],
  ["process", "Process"],
  ["batch", "Batch weight (g)"],
  ["target", "Target style"],
  ["goal", "Your observation goal"],
] as const;
type PlanSnapshot = {
  guide: MockGuide;
  inputs: Record<string, string>;
  coffeeName: string;
  equipmentName: string;
};

export function LabScreen({ kind }: { kind: LabKind }) {
  const router = useRouter();
  const { equipment, timers, saveSession } = useDemo();
  const [form, setForm] = useState<Record<string, string>>({
    ...(kind === "brew" ? defaultBrew : defaultRoast),
  });
  const [snapshot, setSnapshot] = useState<PlanSnapshot | null>(null);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const get = (key: string) => form[key] ?? "";
  const choices = equipment
    .filter((e) => e.kind === kind)
    .sort((a, b) => Number(b.favorite) - Number(a.favorite));

  function createPlan() {
    const common = {
      coffeeName: get("coffeeName").trim(),
      origin: get("origin").trim(),
      process: get("process"),
      equipmentName: get("equipmentName"),
      goal: get("goal"),
    };
    const brew: BrewInputs = {
      ...common,
      roastLevel: get("roastLevel"),
      grinder: get("grinder"),
      water: get("water"),
      dose: get("dose"),
    };
    const roast: RoastInputs = {
      ...common,
      variety: get("variety"),
      batch: get("batch"),
      target: get("target"),
    };
    const problem =
      kind === "brew" ? validateBrewInput(brew) : validateRoastInput(roast);
    if (problem) {
      setError(true);
      setMessage(problem);
      return;
    }
    setSnapshot({
      guide: kind === "brew" ? mockBrewGuide(brew) : mockRoastGuide(roast),
      inputs: { ...(kind === "brew" ? brew : roast) },
      coffeeName: common.coffeeName,
      equipmentName: common.equipmentName,
    });
    setSaved(false);
    setError(false);
    setMessage(
      "Sample plan ready. Your inputs have been captured with this plan.",
    );
  }
  async function save() {
    if (!snapshot || saving) return;
    setSaving(true);
    const now = new Date().toISOString();
    const timer = timers[kind];
    try {
      await saveSession({
        schemaVersion: 1,
        id: newId(),
        kind,
        title: snapshot.guide.title,
        coffeeName: snapshot.coffeeName,
        equipmentName: snapshot.equipmentName,
        createdAt: now,
        updatedAt: now,
        inputs: { ...snapshot.inputs },
        guide: snapshot.guide,
        notes,
        favorite: false,
        timer: {
          elapsedMs: elapsedTime(timer, clock()),
          markers: timer.markers.map((m) => ({ ...m })),
        },
      });
      setSaved(true);
      setError(false);
      setMessage("Saved to Lab Journal for this preview session.");
    } catch {
      setError(true);
      setMessage("Could not save this sample. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen
      title={kind === "brew" ? "Brew Lab" : "Roast Lab"}
      eyebrow={
        kind === "brew"
          ? "BENCH 01 · BREW & NOTICE"
          : "BENCH 02 · ROAST & RECORD"
      }
      subtitle={
        kind === "brew"
          ? "Know your beans. Try a plan. Keep what you learn."
          : "A place for green coffee, careful observations, and your next question."
      }
    >
      <Card>
        <Text style={ui.eyebrow}>YOUR SETUP</Text>
        <Text accessibilityRole="header" style={ui.heading}>
          {kind === "brew" ? "Choose your brewer" : "Choose your roaster"}
        </Text>
        <View style={ui.row}>
          {choices.map((e) => (
            <Chip
              key={e.id}
              label={e.name}
              selected={get("equipmentName") === e.name}
              onPress={() => setForm((f) => ({ ...f, equipmentName: e.name }))}
            />
          ))}
        </View>
        <Button secondary onPress={() => router.push("/settings")}>
          Manage equipment
        </Button>
        {kind === "roast" && (
          <Text style={[ui.muted, { color: colors.copper }]}>
            Original Behmor controls are awaiting manual verification. This
            preview records observations and supplies no machine settings.
          </Text>
        )}
      </Card>
      <Card>
        <Text accessibilityRole="header" style={ui.heading}>
          {kind === "brew" ? "What’s on the bench?" : "Your green coffee"}
        </Text>
        {(kind === "brew" ? brewFields : roastFields).map(([key, label]) => (
          <Field
            key={key}
            label={label}
            value={get(key)}
            onChangeText={(value) => setForm((f) => ({ ...f, [key]: value }))}
            maxLength={key === "goal" ? 400 : 100}
            keyboardType={
              key === "dose" || key === "batch" ? "decimal-pad" : "default"
            }
            multiline={key === "goal"}
          />
        ))}
        <Text style={ui.muted}>
          Photo scanning comes later. You can enter the information from your
          bag here.
        </Text>
        <Button onPress={createPlan}>
          {kind === "brew"
            ? "Create sample brew plan"
            : "Create observation plan"}
        </Button>
        {message && <Message error={error}>{message}</Message>}
      </Card>
      {snapshot && (
        <Card>
          <Text style={ui.eyebrow}>DEMO PLAN · UNVERIFIED</Text>
          <Text accessibilityRole="header" style={ui.heading}>
            {snapshot.guide.title}
          </Text>
          <View style={ui.row}>
            {snapshot.guide.parameters.map((p) => (
              <View
                key={p.label}
                style={{
                  flex: 1,
                  minWidth: 100,
                  backgroundColor: colors.paleSage,
                  borderRadius: 12,
                  padding: 14,
                  gap: 6,
                }}
              >
                <Text style={ui.muted}>{p.label}</Text>
                <Text style={[ui.body, { fontWeight: "700" }]}>{p.value}</Text>
              </View>
            ))}
          </View>
          {snapshot.guide.steps.map((step, i) => (
            <View
              key={step}
              style={[ui.row, { flexWrap: "nowrap", alignItems: "flex-start" }]}
            >
              <Text style={[ui.eyebrow, { paddingTop: 4 }]}>
                {String(i + 1).padStart(2, "0")}
              </Text>
              <Text style={[ui.body, { flex: 1 }]}>{step}</Text>
            </View>
          ))}
          <Text style={ui.muted}>{snapshot.guide.disclaimer}</Text>
          <Text style={ui.muted}>
            Editing the fields above will not alter this plan. Create a new plan
            to capture new inputs.
          </Text>
        </Card>
      )}
      <LabTimer kind={kind} />
      <Card>
        <Text accessibilityRole="header" style={ui.heading}>
          File your experiment
        </Text>
        <Field
          label="Session notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          maxLength={8000}
          placeholder="What did you notice? What would you change?"
        />
        <Button
          disabled={!snapshot || saved || saving}
          onPress={() => {
            void save();
          }}
        >
          {saved ? "Session saved" : saving ? "Saving…" : "Save to Lab Journal"}
        </Button>
        {saved && (
          <Button secondary onPress={() => router.push("/journal")}>
            View saved sessions
          </Button>
        )}
        <Text style={ui.muted}>
          Sample saves stay in this running app only. Durable offline storage
          and accounts are planned for a later phase.
        </Text>
      </Card>
    </Screen>
  );
}
