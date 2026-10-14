export type LabKind = "brew" | "roast";
export type Equipment = {
  id: string;
  name: string;
  kind: LabKind;
  favorite: boolean;
  custom: boolean;
};
export type TimerMarker = { id: string; label: string; elapsedMs: number };
export type TimerState = {
  accumulatedMs: number;
  startedAtMs: number | null;
  markers: TimerMarker[];
};
export type MockGuide = {
  schemaVersion: 1;
  kind: LabKind;
  title: string;
  parameters: { label: string; value: string }[];
  steps: string[];
  evidenceStatus: "demo";
  disclaimer: string;
};
export type JournalSession = {
  schemaVersion: 1;
  id: string;
  kind: LabKind;
  title: string;
  coffeeName: string;
  equipmentName: string;
  createdAt: string;
  updatedAt: string;
  inputs: Record<string, string>;
  guide: MockGuide;
  notes: string;
  favorite: boolean;
  timer: { elapsedMs: number; markers: TimerMarker[] };
};

/** Storage port: later adapters can implement durable offline storage and sync. */
export interface JournalRepository {
  list(): Promise<JournalSession[]>;
  save(session: JournalSession): Promise<void>;
  updateNotes(id: string, notes: string, updatedAt: string): Promise<void>;
  toggleFavorite(id: string, updatedAt: string): Promise<void>;
}

function cloneSession(session: JournalSession): JournalSession {
  return {
    ...session,
    inputs: { ...session.inputs },
    guide: {
      ...session.guide,
      parameters: session.guide.parameters.map((p) => ({ ...p })),
      steps: [...session.guide.steps],
    },
    timer: {
      ...session.timer,
      markers: session.timer.markers.map((m) => ({ ...m })),
    },
  };
}

export function createMemoryJournalRepository(
  seed: JournalSession[],
): JournalRepository {
  const rows = new Map(seed.map((s) => [s.id, cloneSession(s)]));
  return {
    async list() {
      return [...rows.values()]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(cloneSession);
    },
    async save(session) {
      rows.set(session.id, cloneSession(session));
    },
    async updateNotes(id, notes, updatedAt) {
      const row = rows.get(id);
      if (!row) throw new Error("Session not found");
      rows.set(id, { ...row, notes, updatedAt });
    },
    async toggleFavorite(id, updatedAt) {
      const row = rows.get(id);
      if (!row) throw new Error("Session not found");
      rows.set(id, { ...row, favorite: !row.favorite, updatedAt });
    },
  };
}

export function searchSessions(
  sessions: JournalSession[],
  query: string,
  filter: "all" | LabKind | "favorites" = "all",
) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return sessions.filter((s) => {
    if (filter === "favorites" && !s.favorite) return false;
    if ((filter === "brew" || filter === "roast") && s.kind !== filter)
      return false;
    const text = [
      s.title,
      s.coffeeName,
      s.equipmentName,
      s.notes,
      ...Object.values(s.inputs),
    ]
      .join(" ")
      .toLocaleLowerCase();
    return terms.every((term) => text.includes(term));
  });
}

export const emptyTimer = (): TimerState => ({
  accumulatedMs: 0,
  startedAtMs: null,
  markers: [],
});
/** Caller supplies a monotonic clock; ticking frequency does not determine elapsed time. */
export function elapsedTime(timer: TimerState, nowMs: number): number {
  return (
    timer.accumulatedMs +
    (timer.startedAtMs === null ? 0 : Math.max(0, nowMs - timer.startedAtMs))
  );
}
export function toggleTimer(timer: TimerState, nowMs: number): TimerState {
  return timer.startedAtMs === null
    ? { ...timer, startedAtMs: nowMs }
    : { ...timer, accumulatedMs: elapsedTime(timer, nowMs), startedAtMs: null };
}
export function addTimerMarker(
  timer: TimerState,
  nowMs: number,
  id: string,
  label: string,
): TimerState {
  return {
    ...timer,
    markers: [
      ...timer.markers,
      {
        id,
        label: label.trim() || "Marker",
        elapsedMs: elapsedTime(timer, nowMs),
      },
    ],
  };
}
export function formatDuration(ms: number): string {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}

export const starterEquipment: Equipment[] = [
  ["calphalon", "Calphalon espresso machine"],
  ["chemex", "Chemex"],
  ["bee-house", "Bee House cone"],
  ["siphon", "Siphon"],
  ["aeropress", "AeroPress"],
  ["french-press", "French Press"],
  ["moka", "Bialetti Moka Pot"],
].map(([id, name]) => ({
  id: id!,
  name: name!,
  kind: "brew",
  favorite: id === "calphalon",
  custom: false,
}));
starterEquipment.push({
  id: "behmor",
  name: "Behmor 1600 (original)",
  kind: "roast",
  favorite: true,
  custom: false,
});

export function validateEquipmentName(
  name: string,
  equipment: Equipment[],
  kind: LabKind,
): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Give your equipment a name.";
  if (trimmed.length > 80) return "Use 80 characters or fewer.";
  if (
    equipment.some(
      (e) =>
        e.kind === kind &&
        e.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase(),
    )
  ) {
    return "That equipment is already in your collection.";
  }
  return null;
}

export type BrewInputs = {
  coffeeName: string;
  origin: string;
  process: string;
  roastLevel: string;
  equipmentName: string;
  grinder: string;
  water: string;
  dose: string;
  goal: string;
};
export type RoastInputs = {
  coffeeName: string;
  origin: string;
  variety: string;
  process: string;
  equipmentName: string;
  batch: string;
  target: string;
  goal: string;
};
export function validateBrewInput(input: BrewInputs): string | null {
  if (!input.coffeeName.trim() || !input.origin.trim())
    return "Add a coffee name and origin.";
  const dose = Number(input.dose);
  if (!Number.isFinite(dose) || dose <= 0 || dose > 150)
    return "Enter a dose between 0 and 150 grams.";
  return null;
}
export function validateRoastInput(input: RoastInputs): string | null {
  if (!input.coffeeName.trim() || !input.origin.trim())
    return "Add a coffee name and origin.";
  const batch = Number(input.batch);
  if (!Number.isFinite(batch) || batch <= 0 || batch > 5000)
    return "Enter a batch between 0 and 5,000 grams.";
  return null;
}
export function mockBrewGuide(input: BrewInputs): MockGuide {
  const espresso = /espresso/i.test(input.equipmentName);
  const dose = Number(input.dose);
  return {
    schemaVersion: 1,
    kind: "brew",
    title: `${input.coffeeName} · ${input.equipmentName}`,
    parameters: [
      { label: "Coffee", value: `${dose} g` },
      {
        label: espresso ? "Example yield" : "Example water",
        value: `${dose * (espresso ? 2 : 16)} g`,
      },
      { label: "Example ratio", value: espresso ? "1:2" : "1:16" },
    ],
    steps: espresso
      ? [
          "Prepare your basket and record the dose.",
          "Start the timer with your shot; mark the finish.",
          "Record yield and tasting notes to compare next time.",
        ]
      : [
          "Prepare your brewer and record the dose.",
          "Start the timer with your first water; mark each stage.",
          "Record the finish time and tasting notes.",
        ],
    evidenceStatus: "demo",
    disclaimer:
      "Illustrative recipe only. Parameters are mock data, not verified recommendations for this equipment.",
  };
}
export function mockRoastGuide(input: RoastInputs): MockGuide {
  return {
    schemaVersion: 1,
    kind: "roast",
    title: `${input.coffeeName} · ${input.target}`,
    parameters: [
      { label: "Recorded batch", value: `${input.batch} g` },
      { label: "Goal", value: input.target },
    ],
    steps: [
      "Record your green coffee and target before the session.",
      "Use your exact manufacturer manual for settings and safety. This prototype supplies no button, power, or temperature instructions.",
      "Use the timer to record observations, first crack, and cooling; stay with the equipment throughout.",
      "Save your observations and review them after the coffee has rested.",
    ],
    evidenceStatus: "demo",
    disclaimer:
      "Observation plan only. Machine controls and roast advice await verification; no mid-roast control changes are suggested.",
  };
}

export type MockLesson = { title: string; answer: string; experiment: string };
export function mockLesson(question: string): MockLesson {
  if (/water|ratio/i.test(question))
    return {
      title: "Make one change at a time",
      answer:
        "For this practice lesson, compare two cups while keeping your coffee and preparation consistent. Record the water you used and how each cup tasted.",
      experiment:
        "In Brew Lab, give each session a clear name and describe the difference in your notes.",
    };
  if (/roast|process|natural|washed/i.test(question))
    return {
      title: "Start with the bag, then your observations",
      answer:
        "A coffee label is a useful place to record origin, process, and roast description. Treat those as label information; your own tasting notes belong alongside them.",
      experiment:
        "Compare two bags and list what is stated, what you observed, and what you still want to learn.",
    };
  return {
    title: "Your cup is a little experiment",
    answer:
      "Start a simple coffee journal: write down your beans, equipment, dose, and what you noticed. A repeatable record helps you ask more focused questions next time.",
    experiment:
      "Make a sample brew, mark a moment on the timer, and save one tasting note.",
  };
}
