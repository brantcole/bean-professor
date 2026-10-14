export type BrewInput = {
  device: string;
  origin: string;
  process: string;
  roastLevel: string;
  grinder: string;
  waterProfile: string;
  doseGrams: string;
  goal: string;
  /** Extra detail read off a bag label or roaster description. */
  labelNotes: string;
};

export type RoastInput = {
  roaster: string;
  origin: string;
  variety: string;
  process: string;
  density: string;
  batchSize: string;
  targetProfile: string;
  goal: string;
  /** Extra detail read off a green-coffee label or spec sheet. */
  labelNotes: string;
};


// Devices owned by the user come first and are the default.
export const MY_BREW_DEVICES = [
  "Calphalon espresso machine",
  "Chemex",
  "Bee House pourover cone",
  "Siphon",
  "AeroPress",
  "French Press",
  "Bialetti Moka Pot",
];

export const OTHER_BREW_DEVICES = [
  "Hario V60",
  "Kalita Wave",
  "Clever Dripper",
  "Cold Brew",
];

export const BREW_DEVICES = [...MY_BREW_DEVICES, ...OTHER_BREW_DEVICES];

// Short machine notes so recipes respect the real control surface of each device.
export const DEVICE_NOTES: Record<string, string> = {
  "Calphalon espresso machine":
    "Consumer pump machine (~15 bar OPV, pressurized/unpressurized basket options, no PID, no flow control, no pre-infusion control). Give dose/yield/time targets and thermal-surfing + temperature-stability workarounds instead of pressure profiling.",
  Chemex: "Thick bonded filter, slow flow, high fines clog risk. Coarser than V60, longer contact time.",
  "Bee House pourover cone":
    "Wedge dripper with two small holes and Melitta #4 filters; flow is restricted by the cone, so it behaves between a V60 and a Kalita — bed depth and pour rate matter more than grind alone.",
  Siphon: "Full immersion + vacuum draw with a cloth/paper/metal filter; control heat, stir timing, and draw-down.",
  AeroPress: "Immersion with a short pressed extraction; specify inverted vs standard, steep time, stirs, and press duration.",
  "French Press": "Full immersion, metal mesh; specify crust break, skim, steep time, and decant to avoid over-extraction.",
  "Bialetti Moka Pot":
    "Stovetop pressure (~1.5 bar). Specify pre-heated water fill, flame level, grind between filter and espresso, and when to pull it off the heat.",
};

export const MY_ROASTERS = ["Behmor 1600 (original model)"];

export const ROASTER_NOTES: Record<string, string> = {
  "Behmor 1600 (original model)":
    "1 lb drum roaster on a household 120V circuit: preset profiles P1–P5, A–D power levels, drum speed toggle, and a smoke-suppression cooling cycle. CRITICAL: the original 1600 has NO manual override — once Start is pressed, the selected P#/letter/weight settings are locked in and cannot be changed mid-roast. The only in-roast action available is hitting Cool early to end the roast. It has no PID and no bean probe. Express the entire profile as pre-roast decisions (profile choice, power letter, batch weight setting) plus sensory checkpoints (sight/sound of first crack with elapsed time) that tell the user whether to let it run or hit Cool early. Never suggest mid-roast power or time adjustments. Warn about heat soak between batches, and advise choosing profile/weight settings that build in enough headroom to reach first crack before the cycle's automatic cutoff.",
};


export const ORIGINS = [
  "Ethiopia — Yirgacheffe",
  "Ethiopia — Guji",
  "Kenya — Nyeri",
  "Colombia — Huila",
  "Colombia — Nariño",
  "Costa Rica — Tarrazú",
  "Guatemala — Huehuetenango",
  "Panama — Boquete (Gesha)",
  "Brazil — Cerrado",
  "Rwanda — Nyamasheke",
  "Burundi — Kayanza",
  "Indonesia — Sumatra",
  "Yemen — Haraz",
  "Blend — Espresso",
  "Blend — House filter",
];

export const PROCESSES = ["Washed", "Natural", "Honey", "Anaerobic", "Wet-hulled", "Carbonic maceration"];

export const ROAST_LEVELS = ["Light / Nordic", "Light-medium", "Medium", "Medium-dark", "Dark"];

export const TARGET_PROFILES = [
  "Light filter — floral and tea-like",
  "Light-medium filter — balanced sweetness",
  "Omni — filter and espresso",
  "Modern espresso — fruit-forward",
  "Classic espresso — chocolate and caramel",
  "Dark — bold and smoky",
];

export const ROAST_MACHINES = [
  ...MY_ROASTERS,
  "SR540 / air roaster",
  "Aillio Bullet R1",
  "Kaleido M2 / M10",
  "Probat drum (1–5 kg)",
  "Loring Smart Roast",
  "Skillet / pan roast",
];


/** Pick the closest existing option for a value read off a label, else "". */
export function matchOption(options: readonly string[], value: string): string {
  const v = value.trim().toLowerCase();
  if (!v) return "";
  const exact = options.find((o) => o.toLowerCase() === v);
  if (exact) return exact;
  const contains = options.find(
    (o) => o.toLowerCase().includes(v) || v.includes(o.toLowerCase()),
  );
  if (contains) return contains;
  const token = v.split(/[^a-z]+/).filter(Boolean)[0];
  return token ? (options.find((o) => o.toLowerCase().includes(token)) ?? "") : "";
}

/** Build a one-line label summary passed to the Professor as extra context. */
export function summarizeLabel(reading: {
  coffeeName?: string;
  origin?: string;
  region?: string;
  producer?: string;
  variety?: string;
  process?: string;
  roastLevel?: string;
  elevation?: string;
  flavorNotes?: string;
  roastDate?: string;
  summary?: string;
}): string {
  const parts: string[] = [];
  const add = (label: string, value?: string) => {
    if (value && value.trim()) parts.push(`${label}: ${value.trim()}`);
  };
  add("Coffee", reading.coffeeName);
  add("Origin", reading.origin);
  add("Region", reading.region);
  add("Producer", reading.producer);
  add("Variety", reading.variety);
  add("Process", reading.process);
  add("Roast level", reading.roastLevel);
  add("Elevation", reading.elevation);
  add("Tasting notes on the bag", reading.flavorNotes);
  add("Roast date", reading.roastDate);
  add("Other", reading.summary);
  return parts.join("; ").slice(0, 1200);
}
