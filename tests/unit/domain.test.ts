import { describe, expect, it } from "vitest";
import {
  addTimerMarker,
  createMemoryJournalRepository,
  elapsedTime,
  emptyTimer,
  formatDuration,
  mockBrewGuide,
  mockRoastGuide,
  searchSessions,
  starterEquipment,
  toggleTimer,
  validateBrewInput,
  validateEquipmentName,
  validateRoastInput,
} from "../../packages/domain/src/index";
import {
  defaultBrew,
  defaultRoast,
  sampleSessions,
} from "../../apps/mobile/src/data/fixtures";

describe("journal storage port", () => {
  it("preserves guide, inputs, notes, and markers as independent snapshots", async () => {
    const repository = createMemoryJournalRepository([]);
    const session = {
      ...sampleSessions[0]!,
      id: "snapshot",
      inputs: { ...defaultBrew },
      timer: {
        elapsedMs: 1500,
        markers: [{ id: "mark", label: "Bloom", elapsedMs: 1000 }],
      },
    };
    await repository.save(session);
    session.inputs.coffeeName = "Later edit";
    session.timer.markers[0]!.label = "Changed";
    const [saved] = await repository.list();
    expect(saved!.inputs["coffeeName"]).toBe(defaultBrew.coffeeName);
    expect(saved!.timer.markers[0]!.label).toBe("Bloom");
    saved!.guide.steps[0] = "Mutated output";
    expect((await repository.list())[0]!.guide.steps[0]).not.toBe(
      "Mutated output",
    );
  });
  it("updates notes without overwriting a historical plan or markers", async () => {
    const repository = createMemoryJournalRepository(sampleSessions);
    await repository.updateNotes(
      "sample-brew",
      "A sweeter cup",
      "2026-10-14T12:00:00Z",
    );
    const session = (await repository.list()).find(
      (s) => s.id === "sample-brew",
    )!;
    expect(session.notes).toBe("A sweeter cup");
    expect(session.guide).toEqual(sampleSessions[0]!.guide);
    expect(session.timer).toEqual(sampleSessions[0]!.timer);
    expect(session.updatedAt).toBe("2026-10-14T12:00:00Z");
  });
  it("repeated saves with the same id do not duplicate rows", async () => {
    const repository = createMemoryJournalRepository([]);
    await repository.save(sampleSessions[0]!);
    await repository.save(sampleSessions[0]!);
    expect(await repository.list()).toHaveLength(1);
  });
  it("isolates repositories and seed fixtures", async () => {
    const a = createMemoryJournalRepository(sampleSessions);
    const b = createMemoryJournalRepository(sampleSessions);
    await a.toggleFavorite("sample-brew", "2026-10-14T12:00:00Z");
    expect((await a.list())[0]!.favorite).toBe(false);
    expect((await b.list())[0]!.favorite).toBe(true);
    expect(sampleSessions[0]!.favorite).toBe(true);
  });
  it("reports missing records rather than pretending updates succeeded", async () => {
    const repository = createMemoryJournalRepository([]);
    await expect(repository.updateNotes("missing", "x", "")).rejects.toThrow(
      "Session not found",
    );
    await expect(repository.toggleFavorite("missing", "")).rejects.toThrow(
      "Session not found",
    );
  });
});
describe("journal search", () => {
  it("combines case-insensitive terms across equipment and notes", () => {
    expect(
      searchSessions(sampleSessions, " CHEMEX peach ", "brew").map((s) => s.id),
    ).toEqual(["sample-brew"]);
  });
  it("supports favorites and session-kind filters", () => {
    expect(searchSessions(sampleSessions, "", "favorites")).toHaveLength(1);
    expect(searchSessions(sampleSessions, "Huila", "roast")).toHaveLength(1);
    expect(searchSessions(sampleSessions, "Huila", "brew")).toHaveLength(0);
    expect(searchSessions(sampleSessions, "nonexistent")).toHaveLength(0);
  });
});
describe("timestamp-derived timer", () => {
  it("counts a long interval without relying on scheduled ticks", () => {
    const running = toggleTimer(emptyTimer(), 1000);
    expect(elapsedTime(running, 61000)).toBe(60000);
  });
  it("pauses at the exact supplied clock time and resumes without counting the pause", () => {
    const paused = toggleTimer(toggleTimer(emptyTimer(), 1000), 2550);
    expect(elapsedTime(paused, 10000)).toBe(1550);
    const resumed = toggleTimer(paused, 10000);
    expect(elapsedTime(resumed, 10500)).toBe(2050);
  });
  it("records named markers at exact timestamps and retains them after pause", () => {
    const running = toggleTimer(emptyTimer(), 0);
    const marked = addTimerMarker(running, 90321, "m1", " First crack ");
    expect(toggleTimer(marked, 91000).markers).toEqual([
      { id: "m1", label: "First crack", elapsedMs: 90321 },
    ]);
  });
  it("formats long sessions and guards a backwards clock input", () => {
    expect(formatDuration(3600000)).toBe("60:00");
    expect(elapsedTime(toggleTimer(emptyTimer(), 1000), 500)).toBe(0);
  });
});
describe("equipment and mock plans", () => {
  it("includes the owned starter equipment and original Behmor", () => {
    expect(starterEquipment.filter((e) => e.kind === "brew")).toHaveLength(7);
    expect(starterEquipment.find((e) => e.kind === "roast")!.name).toBe(
      "Behmor 1600 (original)",
    );
  });
  it("rejects empty and duplicate equipment names without mixing equipment kinds", () => {
    expect(validateEquipmentName(" ", starterEquipment, "brew")).toBeTruthy();
    expect(
      validateEquipmentName(" chemex ", starterEquipment, "brew"),
    ).toBeTruthy();
    expect(
      validateEquipmentName("Custom roaster", starterEquipment, "roast"),
    ).toBeNull();
  });
  it("rejects invalid amounts before producing a plan", () => {
    for (const dose of ["0", "-1", "NaN", "Infinity", "151"])
      expect(validateBrewInput({ ...defaultBrew, dose })).toBeTruthy();
    expect(validateBrewInput({ ...defaultBrew, coffeeName: " " })).toBeTruthy();
    expect(
      validateRoastInput({ ...defaultRoast, batch: "beans" }),
    ).toBeTruthy();
    expect(validateBrewInput(defaultBrew)).toBeNull();
    expect(validateRoastInput(defaultRoast)).toBeNull();
  });
  it("marks all mock plans as demo content without fabricated sources", () => {
    expect(mockBrewGuide(defaultBrew).evidenceStatus).toBe("demo");
    expect(
      mockBrewGuide({ ...defaultBrew, equipmentName: "Chemex" }).parameters[1]!
        .value,
    ).toBe("288 g");
    expect(mockRoastGuide(defaultRoast).evidenceStatus).toBe("demo");
  });
  it("withholds machine settings even when the input requests unsafe changes", () => {
    const guide = mockRoastGuide({
      ...defaultRoast,
      goal: "Set P5 then change power mid-roast",
    });
    expect(guide.steps.join(" ")).not.toMatch(/P[1-5]|\d+\s*°|set power/i);
    expect(guide.steps.join(" ")).toContain(
      "supplies no button, power, or temperature instructions",
    );
  });
});
