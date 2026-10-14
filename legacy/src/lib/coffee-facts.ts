export type CoffeeFact = {
  category: string;
  text: string;
  source: string;
};

/**
 * Curated, verifiable facts. Each entry names the standard, publication, or
 * documented record it comes from so nothing here is folklore.
 */
export const COFFEE_FACTS: CoffeeFact[] = [
  {
    category: "Brewing standard",
    text: "The SCA Golden Cup window is a brew strength of 1.15–1.35% total dissolved solids at 18–22% extraction yield — the target most modern recipes are quietly aiming at.",
    source: "Specialty Coffee Association, Golden Cup Standard",
  },
  {
    category: "Brewing standard",
    text: "SCA brewing water should sit near 92–96°C at the bed, with roughly 68–85 mg/L calcium carbonate hardness and a near-neutral pH.",
    source: "SCA Water Quality Handbook & Brewing Standard",
  },
  {
    category: "Coffee science",
    text: "Roasting is driven by Maillard browning and, later, caramelization; the crackling 'first crack' is water vapor and CO₂ rupturing the bean's cell walls around 196–205°C bean temperature.",
    source: "Illy & Viani, Espresso Coffee: The Science of Quality",
  },
  {
    category: "Coffee science",
    text: "A roasted bean keeps releasing carbon dioxide for weeks. That degassing is why very fresh coffee blooms violently and can brew unevenly for the first few days.",
    source: "Rao, The Coffee Roaster's Companion",
  },
  {
    category: "Coffee science",
    text: "Finer grinding increases surface area, so extraction speeds up — but past a point the bed's flow resistance rises and water channels through the path of least resistance instead.",
    source: "Cameron et al., Matter (2020), 'Systematically Improving Espresso'",
  },
  {
    category: "Geography",
    text: "Arabica originated in the montane forests of southwestern Ethiopia, where it still grows wild — the genetic reservoir for nearly every cultivar in the world.",
    source: "World Coffee Research, Arabica variety origins",
  },
  {
    category: "Geography",
    text: "Coffea arabica is an allotetraploid: a natural hybrid of Coffea canephora (robusta) and Coffea eugenioides, which is why it carries roughly half the caffeine of robusta.",
    source: "Lashermes et al., Molecular and General Genetics (1999)",
  },
  {
    category: "Terroir",
    text: "Higher-altitude coffee matures more slowly in cooler air, producing denser beans with more concentrated sugars and acids — the reason Ethiopian and Colombian highland lots grade so brightly.",
    source: "Specialty Coffee Association research on altitude and density",
  },
  {
    category: "Terroir",
    text: "Yemen's Bani Matar terraces are among the oldest cultivated coffee lands on earth, and Yemeni port trade gave 'Mocha' its name.",
    source: "Ukers, All About Coffee",
  },
  {
    category: "History",
    text: "Coffee cultivation and the coffeehouse both spread from 15th-century Sufi communities in Yemen, where the drink was used to stay awake through night devotions.",
    source: "Hattox, Coffee and Coffeehouses",
  },
  {
    category: "History",
    text: "Lloyd's of London began as Edward Lloyd's coffeehouse in the 1680s, where shipping news traded hands over cups until the insurance market grew out of it.",
    source: "Lloyd's of London corporate history",
  },
  {
    category: "History",
    text: "Espresso as we know it dates to Achille Gaggia's 1948 spring-lever machine, which pushed water at around 9 bar and produced the layer of crema for the first time.",
    source: "Illy & Viani, Espresso Coffee: The Science of Quality",
  },
  {
    category: "Brewing tip",
    text: "James Hoffmann's V60 method blooms with roughly twice the coffee's weight in water for 45 seconds — degassing before the main pours makes extraction far more even.",
    source: "James Hoffmann, 'The Ultimate V60 Technique'",
  },
  {
    category: "Brewing tip",
    text: "Rinsing a paper filter with hot water removes papery flavor and preheats the brewer, so the slurry doesn't lose several degrees in the first seconds.",
    source: "SCA brewing best practice",
  },
  {
    category: "Brewing tip",
    text: "Weigh, don't scoop. Scooped doses drift by several grams with roast level and grind, while a 1:16 brew ratio by mass is repeatable across every device.",
    source: "SCA Golden Cup ratio guidance",
  },
  {
    category: "Barista wisdom",
    text: "Scott Rao's grinding rule of thumb: grind as fine as you can without stalling or provoking bitterness — fineness raises extraction until uniformity breaks down.",
    source: "Scott Rao, Everything But Espresso",
  },
  {
    category: "Barista wisdom",
    text: "Tim Wendelboe built his reputation on the idea that the roaster's job is to remove obstacles between the farm and the cup, not to add flavor of its own.",
    source: "Tim Wendelboe, published roasting interviews",
  },
  {
    category: "Coffee science",
    text: "Cold brew's low temperature extracts fewer of the acids and bitter compounds that hot water pulls quickly, which is why the same beans taste smoother and sweeter cold-brewed.",
    source: "Fuller & Rao, Scientific Reports (2017)",
  },
  {
    category: "Processing",
    text: "Natural (dry) processing dries the whole cherry around the seed, letting fruit sugars and fermentation compounds migrate inward — the source of that heavy berry character.",
    source: "SCA processing method references",
  },
  {
    category: "Cupping",
    text: "A coffee scoring 80 points or above on the SCA's 100-point scale is what formally qualifies as 'specialty'.",
    source: "Specialty Coffee Association cupping protocol",
  },
  {
    category: "Coffee science",
    text: "Caffeine is a natural pesticide: the coffee plant concentrates it in seeds and young leaves, where it deters insects and inhibits competing seedlings.",
    source: "Ashihara et al., Phytochemistry (2008)",
  },
  {
    category: "Coffee science",
    text: "Roasted coffee contains over 1,000 identified volatile aroma compounds, more than wine.",
    source: "Flament, Coffee Flavor Chemistry (2002)",
  },
  {
    category: "Coffee science",
    text: "Chlorogenic acids make up 6–10% of green arabica by weight and break down during roasting into quinic and caffeic acids — a major source of bitterness in dark roasts.",
    source: "Clifford, Journal of the Science of Food and Agriculture (1999)",
  },
  {
    category: "Coffee science",
    text: "Roasted beans lose roughly 12–20% of their green weight, mostly as water, depending on how dark the roast goes.",
    source: "SCA Roaster Skills curriculum",
  },
  {
    category: "Coffee science",
    text: "Second crack, near 224–230°C bean temperature, is the bean's cellulose structure fracturing and releasing oils to the surface.",
    source: "Rao, The Coffee Roaster's Companion",
  },
  {
    category: "Coffee science",
    text: "Crema is an emulsion of CO₂ bubbles, oils and melanoidins; very fresh or robusta-heavy coffee produces more of it.",
    source: "Illy & Viani, Espresso Coffee: The Science of Quality",
  },
  {
    category: "Coffee science",
    text: "Hot water extracts acids first, then sugars, then heavier bitter compounds — why under-extracted coffee tastes sour and over-extracted tastes bitter.",
    source: "SCA Coffee Brewing Control Chart",
  },
  {
    category: "Coffee science",
    text: "Static from grinding makes fine particles cling; a single drop of water on beans before grinding (the Ross Droplet Technique) measurably reduces it.",
    source: "Harper et al., Matter (2023)",
  },
  {
    category: "Coffee science",
    text: "Researchers showed espresso pulled with slightly less coffee and a coarser grind can be more consistent shot-to-shot without losing extraction.",
    source: "Cameron et al., Matter (2020)",
  },
  {
    category: "Coffee science",
    text: "Within 87–93°C, a UC Davis study found brew temperature barely changed flavor once strength and extraction were held constant.",
    source: "Batali et al., Scientific Reports (2020)",
  },
  {
    category: "Coffee science",
    text: "Coffee is about 98.5% water by mass; the remaining ~1.5% dissolved solids carry essentially all the flavor.",
    source: "SCA Golden Cup Standard",
  },
  {
    category: "Geography",
    text: "Brazil has been the world's largest coffee producer for over 150 years, typically supplying roughly a third of global output.",
    source: "International Coffee Organization statistics",
  },
  {
    category: "Geography",
    text: "Vietnam is the world's second-largest coffee producer, overwhelmingly growing robusta in the Central Highlands.",
    source: "International Coffee Organization statistics",
  },
  {
    category: "Geography",
    text: "The 'Bean Belt' lies roughly between the Tropics of Cancer and Capricorn, where frost-free climates allow coffee to grow.",
    source: "World Coffee Research",
  },
  {
    category: "Geography",
    text: "Hawaii's Kona district is one of the few places in the United States where coffee is grown commercially.",
    source: "USDA National Agricultural Statistics Service",
  },
  {
    category: "Geography",
    text: "Kenya's SL28 and SL34 were selected in the 1930s by Scott Agricultural Laboratories — hence 'SL' — and are prized for intense blackcurrant-like acidity.",
    source: "World Coffee Research Variety Catalog",
  },
  {
    category: "Terroir",
    text: "Panama's Geisha variety drew global attention when Hacienda La Esmeralda entered it in Best of Panama in 2004 and its floral cup set record prices.",
    source: "Best of Panama auction records",
  },
  {
    category: "Terroir",
    text: "Volcanic soils in Guatemala's Antigua valley, rich in minerals and well-drained, are a key reason the region's coffees carry chocolatey body.",
    source: "Anacafé regional profiles",
  },
  {
    category: "Terroir",
    text: "Shade-grown coffee ripens more slowly than sun-grown, which tends to increase sugar development in the cherry.",
    source: "Vaast et al., Journal of the Science of Food and Agriculture (2006)",
  },
  {
    category: "Terroir",
    text: "Indonesian 'wet-hulling' (giling basah) removes parchment at high moisture, giving Sumatran coffees their earthy, heavy-bodied profile.",
    source: "SCA processing references",
  },
  {
    category: "Terroir",
    text: "Monsooned Malabar coffee is deliberately exposed to India's monsoon winds for months, swelling the beans and dulling acidity.",
    source: "Coffee Board of India",
  },
  {
    category: "History",
    text: "The word 'coffee' traces through Dutch 'koffie' and Turkish 'kahve' back to the Arabic 'qahwa'.",
    source: "Oxford English Dictionary etymology",
  },
  {
    category: "History",
    text: "Gabriel de Clieu carried a coffee seedling to Martinique around 1720, and much of the Caribbean and Latin American crop descends from that lineage.",
    source: "Pendergrast, Uncommon Grounds",
  },
  {
    category: "History",
    text: "The first coffeehouse in England opened in Oxford in 1650, and the Queen's Lane Coffee House there claims continuous trading since 1654.",
    source: "Ellis, The Coffee-House: A Cultural History",
  },
  {
    category: "History",
    text: "Melitta Bentz patented the paper coffee filter in Germany in 1908 using blotting paper from her son's school notebook.",
    source: "Melitta company history; German patent records",
  },
  {
    category: "History",
    text: "Instant coffee was mass-produced for soldiers in World War I, and Nescafé launched its spray-dried version in 1938.",
    source: "Pendergrast, Uncommon Grounds",
  },
  {
    category: "History",
    text: "Peter Schlumbohm, a chemist, invented the Chemex in 1941; its design is in the permanent collection of the Museum of Modern Art.",
    source: "MoMA collection records",
  },
  {
    category: "History",
    text: "Alfonso Bialetti introduced the Moka Express in 1933, and its eight-sided aluminum design is little changed today.",
    source: "Bialetti company history",
  },
  {
    category: "History",
    text: "Alan Adler, inventor of the Aerobie flying ring, launched the AeroPress in 2005.",
    source: "AeroPress company history",
  },
  {
    category: "History",
    text: "The vacuum (siphon) brewer dates to the 1830s, with Loeff of Berlin credited for an early design.",
    source: "Ukers, All About Coffee",
  },
  {
    category: "History",
    text: "The first World Barista Championship was held in Monte Carlo in 2000.",
    source: "World Coffee Events history",
  },
  {
    category: "History",
    text: "Bach's 'Coffee Cantata' (c. 1735) is a comic opera about a young woman who refuses to give up coffee.",
    source: "Bach-Werke-Verzeichnis BWV 211",
  },
  {
    category: "Processing",
    text: "Honey processing removes the skin but leaves some mucilage on the seed while drying; 'yellow', 'red' and 'black' honey describe how much remains.",
    source: "SCA processing references",
  },
  {
    category: "Processing",
    text: "Washed coffees are fermented 12–72 hours to loosen mucilage before washing — a step that strongly shapes their clean, bright acidity.",
    source: "SCA processing references",
  },
  {
    category: "Processing",
    text: "Carbonic maceration, borrowed from Beaujolais winemaking, was popularized in coffee by 2015 World Barista Champion Saša Šestić.",
    source: "World Coffee Events, 2015 WBC routine",
  },
  {
    category: "Cupping",
    text: "SCA cupping uses 8.25 g of coffee per 150 mL of water at about 93°C, with the crust broken at four minutes.",
    source: "SCA Cupping Protocol",
  },
  {
    category: "Cupping",
    text: "In 2023 the SCA introduced the Coffee Value Assessment, separating what a coffee tastes like from how much a taster likes it.",
    source: "Specialty Coffee Association, CVA",
  },
  {
    category: "Cupping",
    text: "The SCA/World Coffee Research Flavor Wheel (2016) is anchored to a sensory lexicon of 110 attributes, each with a physical reference.",
    source: "SCA & WCR Sensory Lexicon",
  },
  {
    category: "Cupping",
    text: "Specialty green grading allows zero primary defects in a 350 g sample and no more than five full defects total.",
    source: "SCA Green Coffee Grading Protocol",
  },
  {
    category: "Brewing tip",
    text: "Tetsu Kasuya's 4:6 method, which won the 2016 World Brewers Cup, splits water into five pours: the first 40% tunes sweetness vs. acidity, the last 60% tunes strength.",
    source: "World Brewers Cup 2016",
  },
  {
    category: "Brewing tip",
    text: "For the French press, James Hoffmann recommends steeping 4 minutes, breaking and skimming the crust, then waiting 5+ more minutes before plunging only to the surface.",
    source: "James Hoffmann, 'The Ultimate French Press Technique'",
  },
  {
    category: "Brewing tip",
    text: "Starting a Moka pot with pre-heated water shortens time on the stove and reduces the metallic, baked notes from overheated grounds.",
    source: "James Hoffmann, 'The Ultimate Moka Pot Technique'",
  },
  {
    category: "Brewing tip",
    text: "Espresso's classic starting point is a 1:2 ratio by mass in 25–30 seconds; lighter roasts often taste better at 1:2.5–1:3.",
    source: "SCA Barista Skills curriculum",
  },
  {
    category: "Brewing tip",
    text: "Water that's too soft extracts poorly and tastes flat; too hard and it mutes acidity and scales equipment — SCA targets about 68 mg/L hardness.",
    source: "SCA Water Quality Standard",
  },
  {
    category: "Brewing tip",
    text: "Filter coffee typically tastes best 7–21 days after roast; espresso often benefits from a slightly longer rest.",
    source: "SCA freshness guidance",
  },
  {
    category: "Brewing tip",
    text: "Store beans airtight, cool and dark — but not in the fridge, where condensation and odors damage them.",
    source: "National Coffee Association storage guidance",
  },
  {
    category: "Barista wisdom",
    text: "2014 World Barista Champion Hidenori Izaki built his routine around how sensory perception changes with temperature as a coffee cools.",
    source: "World Coffee Events, 2014 WBC routine",
  },
  {
    category: "Barista wisdom",
    text: "Agnieszka Rojewska became the first woman to win the World Barista Championship, in 2018.",
    source: "World Coffee Events",
  },
  {
    category: "Barista wisdom",
    text: "Matt Perger's guiding idea: change one variable at a time and taste — otherwise you can't know what improved the cup.",
    source: "Barista Hustle",
  },
  {
    category: "Barista wisdom",
    text: "Scott Rao argues the rate of rise in a roast should decline steadily; a sudden flick after first crack often tastes baked or smoky.",
    source: "Scott Rao, The Coffee Roaster's Companion",
  },
];
