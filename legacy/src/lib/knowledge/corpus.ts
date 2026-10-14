import type { KnowledgeEntry } from "./types";
import { CORPUS_EXTENDED } from "./corpus-extended";
import { CORPUS_LIBRARY } from "./corpus-library";

/**
 * The Bean Professor's curated codex: published, checkable specialty-coffee
 * sources. SCA standards are `core` and always injected; everything else is
 * selected per request. Claims are kept short and numeric so the model can
 * attribute each parameter it recommends.
 */
const BASE_CORPUS: KnowledgeEntry[] = [
  // ── SCA standards & protocols ────────────────────────────────────────────
  {
    id: "sca-golden-cup",
    name: "SCA Golden Cup Standard / Coffee Brewing Control Chart",
    author: "Specialty Coffee Association",
    type: "standard",
    url: "https://sca.coffee/research/coffee-standards",
    domains: ["extraction", "pourover", "immersion", "sensory"],
    core: true,
    claims: [
      "Target extraction yield 18-22% of the dry coffee mass; strength (TDS) 1.15-1.35% for filter coffee.",
      "Brew ratio of roughly 55 g/L (±10%) of water places a normal brew inside the chart.",
      "Under 18% yield reads sour/underdeveloped; over 22% reads bitter/astringent/drying.",
      "Brew water temperature 92-96 C (197-205 F) at the bed for filter methods.",
    ],
  },
  {
    id: "sca-water",
    name: "SCA Water Quality Standard",
    author: "Specialty Coffee Association",
    type: "standard",
    url: "https://sca.coffee/research/coffee-standards",
    domains: ["water", "extraction"],
    core: true,
    claims: [
      "Target total dissolved solids around 150 mg/L (acceptable 75-250 mg/L).",
      "Total hardness target ~68 mg/L CaCO3 (acceptable 17-85 mg/L).",
      "Alkalinity target ~40 mg/L CaCO3; pH 6.5-7.5; sodium under ~10 mg/L; odour-free, chlorine-free.",
    ],
  },
  {
    id: "sca-cupping",
    name: "SCA Cupping Protocol",
    author: "Specialty Coffee Association",
    type: "standard",
    url: "https://sca.coffee/research/protocols-best-practices",
    domains: ["sensory", "extraction"],
    claims: [
      "Cupping ratio 8.25 g coffee to 150 mL water; water at 93 C; break the crust at 4 minutes.",
      "Grind coarser than filter so 70-75% of particles pass a US #20 mesh sieve.",
      "Evaluate fragrance/aroma, flavour, aftertaste, acidity, body, balance, uniformity, clean cup, sweetness, overall.",
    ],
  },
  {
    id: "sca-roast-color",
    name: "SCA Roast Colour Classification (Agtron / roast degree)",
    author: "Specialty Coffee Association",
    type: "standard",
    domains: ["roast-phases", "sensory"],
    claims: [
      "Agtron gourmet scale: ~95-85 very light, 85-75 light, 75-65 medium-light, 65-55 medium, 55-45 medium-dark, below 45 dark.",
      "Whole-bean and ground readings differ; a large gap between them signals uneven development (scorched or underdeveloped core).",
    ],
  },
  {
    id: "sca-green-grading",
    name: "SCA Green Coffee Grading & Defect Handbook",
    author: "Specialty Coffee Association",
    type: "standard",
    domains: ["green", "defects", "roast-phases"],
    claims: [
      "Specialty grade: zero category 1 defects and no more than 5 full defects per 350 g sample.",
      "Green moisture content 10-12% and water activity below ~0.60 for stable roasting and storage.",
      "Screen size uniformity matters: mixed screens roast unevenly at a fixed charge temperature.",
    ],
  },

  // ── Research, reference texts ────────────────────────────────────────────
  {
    id: "hendon-water",
    name: "Water for Coffee",
    author: "Maxwell Colonna-Dashwood & Christopher Hendon",
    type: "book",
    year: 2015,
    domains: ["water", "extraction"],
    claims: [
      "Magnesium ions extract flavour compounds more aggressively than calcium; magnesium-forward water reads brighter and fruitier.",
      "Bicarbonate buffers acidity: high alkalinity flattens and dulls perceived acidity, low alkalinity leaves the cup sharp and sometimes sour.",
      "A useful specialty-brewing window is roughly 50-175 mg/L hardness with 40-70 mg/L bicarbonate.",
    ],
  },
  {
    id: "cameron-extraction",
    name: "Systematically Improving Espresso (Cameron et al., Matter)",
    author: "Michael Cameron, Christopher Hendon et al.",
    type: "research",
    year: 2020,
    domains: ["espresso", "extraction", "grind"],
    claims: [
      "Coarser grind with a lower brew ratio can raise extraction yield and reproducibility versus grinding finer, because fine beds channel.",
      "Channelling, not average grind size, dominates shot-to-shot variance; even distribution and wetting matter more than dose micro-adjustments.",
      "Pre-wetting the puck at low flow reduces channel formation.",
    ],
  },
  {
    id: "uman-particle",
    name: "The effect of bean origin and temperature on grinding roasted coffee (Scientific Reports)",
    author: "Erol Uman, Christopher Hendon et al.",
    type: "research",
    year: 2016,
    domains: ["grind", "extraction"],
    claims: [
      "Grinding colder beans produces a narrower particle size distribution and more even extraction.",
      "Every grinder produces a bimodal distribution: fines drive both body and astringency.",
    ],
  },
  {
    id: "gagne-extraction",
    name: "The Physics of Filter Coffee",
    author: "Jonathan Gagné",
    type: "book",
    year: 2021,
    url: "https://coffeeadastra.com",
    domains: ["extraction", "pourover", "grind", "water"],
    claims: [
      "Bed depth and pour rate govern flow resistance as much as grind; a deeper bed extracts more at the same grind.",
      "Agitation early in the brew raises extraction; late agitation mostly stirs fines into the bed and increases astringency.",
      "Bypass (pouring outside the bed) reduces strength without changing extraction yield.",
    ],
  },
  {
    id: "rao-roasting",
    name: "The Coffee Roaster's Companion",
    author: "Scott Rao",
    type: "book",
    year: 2014,
    domains: ["roast-phases", "heat-transfer", "defects"],
    claims: [
      "Rate of rise should decline smoothly from turning point to drop; any flick or crash after first crack bakes or scorches the coffee.",
      "Development time ratio (time after first crack ÷ total roast time) of 20-25% suits most filter roasts; below ~15% tends to read sour and grassy.",
      "Drying phase should occupy roughly the first 40-50% of the roast, Maillard the middle, development the last fifth.",
    ],
  },
  {
    id: "rao-espresso",
    name: "Everything But Espresso / The Professional Barista's Handbook",
    author: "Scott Rao",
    type: "book",
    year: 2010,
    domains: ["espresso", "extraction", "immersion", "pourover"],
    claims: [
      "Uniform bed wetting and a flat bed at the end of the brew are the strongest indicators of even extraction.",
      "For immersion methods, stirring the crust and skimming reduces the surface fines layer that causes bitterness on decant.",
    ],
  },
  {
    id: "hoffmann-atlas",
    name: "The World Atlas of Coffee",
    author: "James Hoffmann",
    type: "book",
    year: 2018,
    domains: ["terroir", "sensory", "pourover", "immersion"],
    claims: [
      "Regional flavour signatures: Ethiopian washed lots lean floral/citric/tea-like; naturals lean berry and stone fruit.",
      "Kenyan SL28/SL34 gives blackcurrant and high malic/phosphoric acidity; Colombian Caturra/Castillo gives caramel-sweet and red apple.",
      "Central American washed lots are chocolate-forward with balanced acidity; Sumatran wet-hulled reads earthy, herbal and low-acid.",
    ],
  },
  {
    id: "illy-viani",
    name: "Espresso Coffee: The Science of Quality",
    author: "Andrea Illy & Rinantonio Viani",
    type: "book",
    year: 2005,
    domains: ["espresso", "pressure", "extraction"],
    claims: [
      "Classic espresso reference: 7 g ±0.5 dose, 25 s ±2.5, 30 mL ±5, 9 bar ±2, water 90 C ±5 at the group.",
      "Crema stability depends on CO2 remaining in the bean; roast within 4-30 days for stable crema.",
    ],
  },
  {
    id: "hendon-moka",
    name: "Moka pot thermodynamics research and stovetop pressure studies",
    author: "Various (incl. Navarini, Hendon)",
    type: "research",
    domains: ["pressure", "espresso", "extraction"],
    tags: ["moka", "bialetti", "stovetop"],
    claims: [
      "Moka pots work at ~1-1.5 bar, far below espresso; the correct grind is between filter and espresso, not espresso-fine.",
      "Starting with pre-boiled water shortens the time green-coffee bed spends above 100 C and cuts harsh, burnt notes.",
      "Pulling the pot off the heat and cooling the base at the first sign of sputtering prevents the bitter steam phase.",
    ],
  },
  {
    id: "siphon-thermo",
    name: "Vacuum brewing heat and filtration studies",
    author: "Various (Japanese siphon literature, Coffee Ad Astra)",
    type: "research",
    domains: ["immersion", "heat-transfer", "extraction"],
    tags: ["siphon", "vacuum"],
    claims: [
      "Siphon brews sit at 88-93 C throughout because the chamber is heated during immersion, so total contact time should be shorter than a French press.",
      "Cloth filters give the cleanest, silkiest body; metal filters keep oils and fines for a heavier cup.",
      "Two short stirs (on the rise, and at the start of draw-down) even out the bed without over-agitating.",
    ],
  },

  // ── Competition methods ──────────────────────────────────────────────────
  {
    id: "wbrc-winton-2021",
    name: "World Brewers Cup winning routine",
    author: "Matt Winton",
    type: "competition",
    year: 2021,
    domains: ["pourover", "extraction", "grind"],
    claims: [
      "Very fine grind with a low-agitation, staged pour and a high ratio to keep strength in balance while lifting extraction.",
      "Rest the coffee to a chosen day post-roast and control it as a variable, not an afterthought.",
    ],
  },
  {
    id: "wbrc-hoffmann",
    name: "World Barista Champion routine and V60 technique",
    author: "James Hoffmann",
    type: "competition",
    year: 2007,
    domains: ["pourover", "extraction"],
    claims: [
      "Ultimate V60: 30 g/500 g, bloom with 60 g and swirl, pour to 300 g by 1:15, top to 500 g by 1:45, gentle swirl, finish ~3:30.",
      "Swirling instead of stirring keeps the bed flat and reduces channeling.",
    ],
  },
  {
    id: "wbc-jeon-2019",
    name: "World Barista Championship winning routine",
    author: "Jooyeon Jeon",
    type: "competition",
    year: 2019,
    domains: ["espresso", "sensory"],
    claims: [
      "Temperature control across the whole service chain (cup, milk, water) as a flavour variable.",
      "Short, high-clarity ristretto-leaning ratios for delicate washed lots.",
    ],
  },
  {
    id: "wbc-rojewska-2018",
    name: "World Barista Championship winning routine",
    author: "Agnieszka Rojewska",
    type: "competition",
    year: 2018,
    domains: ["espresso", "sensory"],
    claims: [
      "Simplify the variables and dial for repeatability rather than a peak single shot.",
      "Milk texture and temperature matched to the coffee's sweetness peak (~55-60 C).",
    ],
  },
  {
    id: "wbc-um-2023",
    name: "World Barista Championship winning routine",
    author: "Boram Um",
    type: "competition",
    year: 2023,
    domains: ["espresso", "green", "sensory"],
    claims: [
      "Processing choices at origin (co-fermentation, controlled yeast) treated as a designed flavour input.",
      "Extremely light roasts pushed to higher espresso ratios (1:2.5-1:3) to avoid harshness.",
    ],
  },
  {
    id: "wbc-fukahori-2018",
    name: "World Brewers Cup winning routine",
    author: "Emi Fukahori",
    type: "competition",
    year: 2018,
    domains: ["pourover", "extraction"],
    claims: [
      "Multi-stage pour with tightly controlled pour rate and a fixed drawdown target time.",
      "Water composition selected specifically for the lot rather than a house standard.",
    ],
  },
  {
    id: "aeropress-champs",
    name: "World AeroPress Championship winning recipes (aggregate)",
    author: "World AeroPress Championship competitors",
    type: "competition",
    domains: ["immersion", "extraction"],
    tags: ["aeropress"],
    claims: [
      "Most winning recipes use 15-20 g coffee, 200-250 g water, medium-fine grind, 1:00-2:00 steep, and a slow 20-30 s press.",
      "Inverted brewing plus a bypass dilution at the end is the single most common winning structure.",
      "Water below 90 C is common for light roasts to reduce harshness in a fast immersion.",
    ],
  },

  // ── Roaster methods ──────────────────────────────────────────────────────
  {
    id: "wendelboe-method",
    name: "Roasting philosophy and published profiles",
    author: "Tim Wendelboe",
    type: "roaster",
    url: "https://timwendelboe.no",
    domains: ["roast-phases", "sensory", "terroir"],
    claims: [
      "Light, even roasts developed enough to avoid grassiness; total roast times around 9-12 minutes on drum machines.",
      "Cup every roast against the previous one and change a single variable at a time.",
    ],
  },
  {
    id: "howell-method",
    name: "Roast style and terroir advocacy",
    author: "George Howell",
    type: "roaster",
    domains: ["roast-phases", "terroir", "sensory"],
    claims: [
      "Roast to preserve origin acidity: drop before second crack, never let development flatten fruit character.",
      "Frozen storage of green and roasted coffee to hold volatile aromatics.",
    ],
  },
  {
    id: "coffee-collective",
    name: "Nordic light roasting practice",
    author: "The Coffee Collective",
    type: "roaster",
    domains: ["roast-phases", "sensory"],
    claims: [
      "Short, hot Nordic-style profiles with high charge temperature and declining heat to keep acidity intact.",
      "Development time ratio near the low end (16-20%) paired with high enough energy to avoid underdevelopment.",
    ],
  },
  {
    id: "onyx-method",
    name: "Published roast approach",
    author: "Onyx Coffee Lab",
    type: "roaster",
    domains: ["roast-phases", "sensory", "green"],
    claims: [
      "Profile by density and moisture: denser high-altitude lots take a hotter charge and more early energy.",
      "Sample roast every new lot before committing a production profile.",
    ],
  },
  {
    id: "la-cabra",
    name: "Light-roast production practice",
    author: "La Cabra",
    type: "roaster",
    domains: ["roast-phases", "sensory"],
    claims: [
      "Extended Maillard with restrained early heat to build sweetness in very light roasts.",
      "Longer post-roast rest (10-21 days) for light roasts before they show their best.",
    ],
  },
  {
    id: "sey-method",
    name: "Roast approach for delicate washed lots",
    author: "Sey Coffee",
    type: "roaster",
    domains: ["roast-phases", "terroir"],
    claims: [
      "Minimal-intervention light roasting aimed at transparency to the lot's processing.",
      "Airflow raised through the Maillard phase to avoid baked, papery notes.",
    ],
  },
  {
    id: "behmor-practice",
    name: "Behmor 1600 community profiling practice",
    author: "Behmor roasting community / Joe Behm",
    type: "article",
    domains: ["roast-phases", "heat-transfer"],
    tags: ["behmor", "1600", "drum", "home roaster"],
    claims: [
      "The Behmor 1600 has no bean probe: profile by P-setting, drum speed, batch weight and time, and read first crack by ear.",
      "The 1-lb P1 through P5 profiles change the duty cycle of the heating elements; P1 front-loads energy, P5 is the gentlest ramp.",
      "On the original 1600 the P-setting, power letter and weight setting are locked once the cycle starts — there is no manual override — so all heat decisions are made before pressing Start; the only in-roast control is triggering the cooling cycle early to stop development.",
      "Smaller batches (225-340 g) roast faster and more evenly than the machine's nominal maximum.",
    ],
  },

  // ── Origin / terroir references ─────────────────────────────────────────
  {
    id: "terroir-ethiopia",
    name: "Ethiopian growing regions and heirloom landraces",
    author: "Various (World Atlas of Coffee, ECX region notes)",
    type: "article",
    domains: ["terroir", "sensory", "green"],
    tags: ["ethiopia", "yirgacheffe", "guji", "sidamo", "chelbesa", "heirloom"],
    claims: [
      "Yirgacheffe/Gedeb washed lots: jasmine, bergamot, lemon, tea-like body; very high density, needs energy through the Maillard phase.",
      "Guji and Sidamo naturals: blueberry, strawberry, and a heavier syrupy body; ferment character rewards lower brew temperature.",
    ],
  },
  {
    id: "terroir-kenya",
    name: "Kenyan varieties and processing",
    author: "Various",
    type: "article",
    domains: ["terroir", "sensory"],
    tags: ["kenya", "sl28", "sl34", "ruiru", "batian"],
    claims: [
      "SL28/SL34 with double-washed (Kenya) processing: blackcurrant, tomato, grapefruit, high phosphoric acidity.",
      "High density AA screens need a hotter charge and benefit from a slightly longer development to avoid a savoury edge.",
    ],
  },
  {
    id: "terroir-colombia",
    name: "Colombian regions and varieties",
    author: "Various",
    type: "article",
    domains: ["terroir", "sensory"],
    tags: ["colombia", "huila", "narino", "caturra", "castillo", "pink bourbon"],
    claims: [
      "Huila and Nariño washed lots: red apple, caramel, panela sweetness with balanced malic acidity.",
      "Modern Colombian extended-fermentation lots read much fruitier and need lower brew temperatures to stay clean.",
    ],
  },
  {
    id: "terroir-centrals",
    name: "Central American origins",
    author: "Various",
    type: "article",
    domains: ["terroir", "sensory"],
    tags: ["guatemala", "costa rica", "el salvador", "honduras", "bourbon", "pacamara", "honey"],
    claims: [
      "Guatemalan Antigua/Huehuetenango: cocoa, orange, brown sugar; forgiving across brew methods.",
      "Honey and pulped-natural processing raises perceived body and sweetness while lowering acidity versus fully washed.",
    ],
  },
  {
    id: "terroir-indonesia",
    name: "Indonesian wet-hulled coffees",
    author: "Various",
    type: "article",
    domains: ["terroir", "sensory", "green"],
    tags: ["sumatra", "indonesia", "giling basah", "java", "sulawesi"],
    claims: [
      "Wet-hulled (giling basah) lots: earthy, cedar, herbal, very low acidity, and inconsistent bean moisture.",
      "Low density and irregular moisture mean a lower charge temperature and gentler early heat to avoid tipping and scorching.",
    ],
  },
  {
    id: "terroir-brazil",
    name: "Brazilian naturals and pulped naturals",
    author: "Various",
    type: "article",
    domains: ["terroir", "sensory"],
    tags: ["brazil", "cerrado", "mogiana", "yellow bourbon"],
    claims: [
      "Brazilian naturals: peanut, milk chocolate, low acidity, heavy body; the classic espresso base.",
      "Lower density beans roast faster; reduce charge temperature and watch for baking through the drying phase.",
    ],
  },
  {
    id: "process-chemistry",
    name: "Processing chemistry and fermentation research",
    author: "Various (World Coffee Research, fermentation literature)",
    type: "research",
    domains: ["green", "sensory", "terroir"],
    tags: ["natural", "washed", "honey", "anaerobic", "carbonic", "co-ferment"],
    claims: [
      "Anaerobic and carbonic maceration lots accumulate lactic and acetic acid plus esters, giving boozy/fruity intensity that scorches easily in the roast.",
      "Naturals carry more residual sugars and roast faster through the Maillard phase than washed lots at the same density.",
      "Washed lots express origin acidity most transparently and tolerate lighter development.",
    ],
  },
  {
    id: "degassing",
    name: "Degassing and freshness research",
    author: "Various (Illy, SCA research)",
    type: "research",
    domains: ["extraction", "espresso", "sensory"],
    claims: [
      "Filter roasts are typically best 7-21 days post-roast; espresso roasts 10-30 days.",
      "Excess CO2 in very fresh coffee causes uneven wetting and suppressed extraction; longer bloom compensates.",
    ],
  },
];

export const CORPUS: KnowledgeEntry[] = [...BASE_CORPUS, ...CORPUS_EXTENDED, ...CORPUS_LIBRARY];
