/**
 * PicSpeak story strips — locked Style C (reference: public/style-tests/reference-style-blackout.png).
 * Elena / Marco / Leo: fixed face + outfit every story. B&W + accent colors. Vertical 4-koma.
 */

export const REFERENCE_STYLE_IMAGE = "public/style-tests/reference-style-blackout.png";

export const CHARACTERS = {
  elena: `CHARACTER "Elena" — LOCKED DESIGN (face and outfit NEVER change between stories):
Round head. Dark chin-length bob with wavy/curly texture (solid black hair shape with a few inner curl lines) — EXACTLY like reference. Two small black dot eyes. Simple curved line mouth. Loose long-sleeved plain dress/top (same silhouette every time). Same body proportions every story. NO glasses. NO outfit changes.`,
  marco: `CHARACTER "Marco" — LOCKED DESIGN (face and outfit NEVER change between stories):
Round head. Short dark messy hair with a few strands pointing up at front and back — NO glasses, handsome simple face. Two small black dot eyes. Simple curved line mouth. Collared button-down shirt (same every time). Same body proportions every story. NO outfit changes.`,
  leo: `CHARACTER "Leo" — LOCKED DESIGN (face and outfit NEVER change between stories):
Smaller round head than adults, same art style as Elena/Marco reference. Short simple hair scribble. Two dot eyes. Horizontal striped shirt (blue accent stripes). Small square backpack (red accent). Same design every story.`,
} as const;

export const STORY_DOODLE_STYLE_PROMPT = `
MATCH the attached reference image art style EXACTLY: minimalist black-and-white line art like Sarah's Scribbles. Clean uniform black outlines on white. Round heads, dot eyes, simple mouth lines. Sparse backgrounds (few lines only). Same line weight and character proportions as reference.

Color: mostly black and white. Use SMALL accent colors on key props when clarity needs it (yellow warm glow for lights/candles, blue phone screen light, green bicycle, red flat tire, gray smoke, etc.). Do NOT fully color characters except Leo's stripe/backpack accents.

NO text, NO numbers, NO speech bubbles, NO labels, NO watermarks.

Layout: single TALL vertical image, 4 equal panels stacked top-to-bottom with thin white horizontal gutters ONLY at the 3 boundaries between panels.

PANEL BORDERS (CRITICAL — avoid split artifacts):
- Draw EXACTLY 4 panels. Separate them ONLY with thin white horizontal gutters at panel edges.
- NEVER draw extra horizontal or vertical lines inside a panel that look like panel dividers.
- NO stray lines cutting through characters or backgrounds mid-panel. NO duplicate borders.

CHARACTER CONSISTENCY (CRITICAL): Elena and Marco must look IDENTICAL to the reference image whenever they appear — same hair shape, same face (dot eyes), same clothes.

NARRATIVE CONTINUITY (CRITICAL):
- Same props/clothes in every panel. One bicycle = same green bike, two wheels only, never extra wheels on ground.
- Objects do not vanish between panels without reason.
- Each panel continues the same story in order.
`.trim();

export type StoryStripPlot = {
  setId: string;
  cast: string;
  panels: [string, string, string, string];
  accents?: string;
};

export function buildStoryStripPrompt(plot: StoryStripPlot): string {
  const [p1, p2, p3, p4] = plot.panels;
  return `${STORY_DOODLE_STYLE_PROMPT}
${plot.accents ? `\nAccent colors for this story: ${plot.accents}` : ""}

CAST (use ONLY these characters — omit anyone not listed):
${plot.cast}

Top panel: ${p1}
Second panel: ${p2}
Third panel: ${p3}
Bottom panel: ${p4}
`;
}

export const STORY_PLOTS: StoryStripPlot[] = [
  {
    setId: "bike-flat",
    cast: CHARACTERS.elena,
    accents: "Green bicycle frame. Tiny red mark on flat tire in panel 2.",
    panels: [
      "Elena alone happily riding ONE green bicycle on simple European street. Only Elena, one bike.",
      "Elena stopped beside SAME green bicycle upright. ONE tire flat with tiny red mark. Two wheels only, NO extra wheel on ground.",
      "Elena kneeling pumping SAME green bicycle with hand pump. One bike, two wheels.",
      "Elena riding SAME green bicycle again, small happy smile. One bike only.",
    ],
  },
  {
    setId: "blackout",
    cast: `${CHARACTERS.elena}\n${CHARACTERS.marco}`,
    accents: "Panel 1 ONLY: hanging bulb filled YELLOW with warm glow lines (power ON). Panel 2: bulb has NO yellow — plain outline only (blackout). Panel 3: yellow candle flame. Panel 4: yellow candle glow. Blue-white phone light in panel 3.",
    panels: [
      "Apartment: Elena on sofa reading, Marco at round table with cards. Hanging bulb lit — bulb itself YELLOW with glow lines. Window shows city.",
      "Same room, power out: bulb has NO yellow color, just dark outline, no glow. Elena and Marco surprised O mouths. Crescent moon in window.",
      "Same dark room: Elena lighting candle on table (yellow flame), Marco holding phone with blue-white light rays. Bulb still off, no yellow.",
      "Same room: Elena and Marco on floor playing cards by yellow candle glow, small smiles.",
    ],
  },
  {
    setId: "cooking-disaster",
    cast: CHARACTERS.marco,
    accents: "Gray/black wavy smoke lines from pot. Red pizza box accent in panel 4.",
    panels: [
      "Marco alone happily stirring pot on stove in simple kitchen. Only Marco, same locked design.",
      "Same kitchen: gray/black smoke from SAME pot, Marco shocked O mouth. Same stove, same pot.",
      "Same kitchen: Marco on stool waving towel at ceiling smoke alarm, same smoking pot on stove behind.",
      "Same kitchen: Marco sitting with red pizza box open, awkward relieved smile. Burnt pot still on stove behind.",
    ],
  },
  {
    setId: "dog-escape",
    cast: `${CHARACTERS.elena}\nSmall dog: simple floppy-ear doodle, brown/tan accent on ears.`,
    accents: "Brown/tan accent on dog. Red leash accent when visible.",
    panels: [
      "Elena opening apartment door, small dog waiting eagerly inside. Same Elena design.",
      "Dog dashing outside through open door, Elena reaching surprised. Red leash trailing.",
      "Elena in simple park area calling worried, looking around. No dog yet.",
      "Elena kneeling hugging same dog at building entrance, relieved smile.",
    ],
  },
  {
    setId: "lost-tourist",
    cast: CHARACTERS.marco,
    accents: "Blue accent on phone map screen. Simple landmark (cathedral dome or fountain) visible in panel 1 and 4.",
    panels: [
      "Marco alone on European street, phone with blue map screen, looking toward famous landmark (cathedral dome) in far distance — his sightseeing goal. Confused which way to go.",
      "Marco walking down wrong narrow alley, checking phone map, worried face. Landmark NOT visible — he is lost.",
      "Marco asking simple shop staff stick figure for directions, both gesturing toward correct path.",
      "Marco standing in front of SAME landmark (fountain or cathedral plaza), arrived successfully, big relieved happy smile. Goal reached.",
    ],
  },
  {
    setId: "lost-wallet",
    cast: CHARACTERS.elena,
    accents: "Brown wallet accent when visible.",
    panels: [
      "Elena at café table with coffee cup, reaching into shoulder bag to pay. Same Elena design, same café.",
      "Same café: Elena frantically searching open shoulder bag, panicked O mouth, sweat drops. Brown wallet NOT in bag.",
      "Same café: Elena hand in coat pocket, pulling out brown wallet, surprised relieved expression — it was in pocket all along.",
      "Same café counter: Elena paying with cash bills/coins from wallet to cashier — wallet stays in her other hand or pocket, NOT handed over. Relieved happy smile.",
    ],
  },
  {
    setId: "missed-bus",
    cast: CHARACTERS.elena,
    accents: "Red alarm clock accent panel 1. Yellow bus accent panel 3.",
    panels: [
      "Elena in bed shocked awake, red alarm clock ringing on nightstand. Morning rush.",
      "Same Elena rushing down street holding coffee cup, hurried panicked expression.",
      "Same Elena at bus stop, yellow bus driving away in distance, Elena arm outstretched too late.",
      "Same Elena entering office building entrance, exhausted slump shoulders, late for work.",
    ],
  },
  {
    setId: "moving-day",
    cast: `${CHARACTERS.elena}\n${CHARACTERS.marco}`,
    accents: "Red pizza box accent panel 4.",
    panels: [
      "New apartment full of stacked moving boxes, Elena and Marco standing overwhelmed sigh.",
      "Same apartment stairwell: both carrying same couch up stairs, straining effort faces.",
      "Same apartment: couch box dropped on floor, both shocked open mouths.",
      "Same apartment: sitting on couch among boxes, sharing pizza from red box, tired happy smiles.",
    ],
  },
  {
    setId: "rain-surprise",
    cast: `${CHARACTERS.elena}\n${CHARACTERS.leo}`,
    accents: "Blue rain lines panel 2. Yellow umbrella accent panel 3.",
    panels: [
      "Elena and Leo picnic on blanket in sunny park, pleasant smiles. Same designs.",
      "Same park: sudden blue rain lines falling, both look up surprised.",
      "Same park: running together under one yellow umbrella, wet.",
      "Under shop awning: Elena and Leo sharing warm drink cups, wet hair, laughing.",
    ],
  },
  {
    setId: "surprise-birthday",
    cast: `${CHARACTERS.elena}\n${CHARACTERS.marco}\n${CHARACTERS.leo}\nElena is birthday person. Marco and Leo plan surprise.`,
    accents: "Yellow/pink candle glow on small cake panel 4.",
    panels: [
      "Same apartment: Marco and Leo hiding quietly behind sofa, excited faces. Elena NOT present.",
      "Elena opening front door with grocery bag, unaware, entering apartment.",
      "Lights on: Marco and Leo jumping out from behind sofa, Elena shocked happy face.",
      "Same apartment: three around small table with birthday cake, yellow candle glow, warm smiles.",
    ],
  },
];

/** First 6 story sets for batch generation */
export const STORY_PLOTS_BATCH_1_6 = STORY_PLOTS.slice(0, 6);

/** Story sets 5 and 7–10 */
export const STORY_PLOTS_BATCH_5_7_10 = [
  STORY_PLOTS[4]!,
  ...STORY_PLOTS.slice(6, 10),
];

/** @deprecated Use STORY_DOODLE_STYLE_PROMPT */
export const STORY_ESSAY_CHIBI_PROMPT = STORY_DOODLE_STYLE_PROMPT;

/** @deprecated Use STORY_DOODLE_STYLE_PROMPT */
export const STORY_KIRARA_PROMPT = STORY_DOODLE_STYLE_PROMPT;

/** @deprecated Use STORY_DOODLE_STYLE_PROMPT */
export const STORY_REFERENCE_MANGA_PROMPT = STORY_DOODLE_STYLE_PROMPT;
