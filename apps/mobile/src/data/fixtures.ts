import {
  mockBrewGuide,
  mockRoastGuide,
  type BrewInputs,
  type JournalSession,
  type RoastInputs,
} from "@bean-professor/domain";

export const defaultBrew: BrewInputs = {
  coffeeName: "Guji morning cup",
  origin: "Ethiopia · Guji",
  process: "Natural",
  roastLevel: "Light",
  equipmentName: "Calphalon espresso machine",
  grinder: "Burr grinder",
  water: "Filtered water",
  dose: "18",
  goal: "A sweeter, clearer cup",
};
export const defaultRoast: RoastInputs = {
  coffeeName: "Huila green lot",
  origin: "Colombia · Huila",
  variety: "Caturra",
  process: "Washed",
  equipmentName: "Behmor 1600 (original)",
  batch: "225",
  target: "Balanced sweetness",
  goal: "Record first crack and cooling",
};
export const sampleSessions: JournalSession[] = [
  {
    schemaVersion: 1,
    id: "sample-brew",
    kind: "brew",
    title: "A slower Sunday cup",
    coffeeName: "Guji morning cup",
    equipmentName: "Chemex",
    createdAt: "2026-10-11T13:00:00Z",
    updatedAt: "2026-10-11T13:00:00Z",
    inputs: { ...defaultBrew, equipmentName: "Chemex" },
    guide: mockBrewGuide({ ...defaultBrew, equipmentName: "Chemex" }),
    notes:
      "Peach on the nose, a soft finish. Next time I want to compare a slightly different grind.",
    favorite: true,
    timer: {
      elapsedMs: 225000,
      markers: [
        { id: "sample-bloom", label: "First water", elapsedMs: 0 },
        { id: "sample-finish", label: "Finish", elapsedMs: 225000 },
      ],
    },
  },
  {
    schemaVersion: 1,
    id: "sample-roast",
    kind: "roast",
    title: "Huila observation session",
    coffeeName: "Huila green lot",
    equipmentName: defaultRoast.equipmentName,
    createdAt: "2026-10-10T15:30:00Z",
    updatedAt: "2026-10-10T15:30:00Z",
    inputs: { ...defaultRoast },
    guide: mockRoastGuide(defaultRoast),
    notes:
      "Practice record only. Listen carefully and keep observations separate from assumptions.",
    favorite: false,
    timer: {
      elapsedMs: 720000,
      markers: [
        {
          id: "sample-crack",
          label: "First crack (sample)",
          elapsedMs: 570000,
        },
        { id: "sample-cool", label: "Cooling (sample)", elapsedMs: 720000 },
      ],
    },
  },
];
