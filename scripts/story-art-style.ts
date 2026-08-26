/**
 * PicSpeak story strips — original essay-manga chibi for young adults (20s–30s).
 * Four fixed characters. Vertical 4-koma. No text in images.
 */

export const CHARACTERS = {
  haru: `CHARACTER A "Haru" (ALWAYS draw exactly like this when she appears):
Young woman ~25, office worker. Pale blue-gray bob hair with side part. Beige long open cardigan, white crew-neck tee, black slim pants. Chibi ~3 heads tall, young ADULT face (NOT child). Small simple eyes, clear readable expression. Original design — NOT K-On, NOT any anime series character.`,
  ren: `CHARACTER B "Ren" (ALWAYS draw exactly like this when he appears):
Young man ~27, young professional. Short neat dark brown hair, thin rectangular glasses, navy zip-up jacket, light shirt, chinos. Chibi ~3 heads tall, mature young adult face. Small simple eyes. Original design — NOT K-On, NOT any anime series character.`,
  mei: `CHARACTER C "Mei" (ALWAYS draw exactly like this when she appears):
Young woman ~24. Chestnut brown hair in low ponytail, olive green casual shirt, dark jeans. Chibi ~3 heads tall, young adult face, friendly expression. Small simple eyes. Original design — NOT K-On, NOT any anime series character.`,
  taku: `CHARACTER D "Taku" (ALWAYS draw exactly like this when he appears):
Young man ~22, university age. Tousled sandy brown hair, gray hoodie, jeans, small backpack. Chibi ~3 heads tall, young adult face. Small simple eyes. Original design — NOT K-On, NOT any anime series character.`,
} as const;

export const STORY_ESSAY_CHIBI_PROMPT = `
Art style: ORIGINAL Japanese essay manga / slice-of-life 4-koma for young adults (office workers, university students). Chibi simplified bodies (~3 heads tall) but mature young-adult faces — NOT childish, NOT toddler-like, NOT copying K-On or any existing manga/anime.

Line work: clean medium pen lines, slightly hand-drawn warmth. Minimal detail, essence only — white or near-white background, at most 1–2 simple props per panel. Very faint pale color wash optional; mostly line art.

Expressions: clear and readable but restrained — essay comic tone, not flashy anime.

NO text, NO numbers, NO speech bubbles, NO labels, NO onomatopoeia, NO watermarks anywhere.

Layout: single TALL vertical image, 4 equal panels stacked top-to-bottom with thin white horizontal gutters between panels.
`.trim();

export type StoryStripPlot = {
  setId: string;
  cast: string;
  panels: [string, string, string, string];
};

export function buildStoryStripPrompt(plot: StoryStripPlot): string {
  const [p1, p2, p3, p4] = plot.panels;
  return `${STORY_ESSAY_CHIBI_PROMPT}

CAST (use ONLY these characters, keep designs fixed):
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
    cast: CHARACTERS.haru,
    panels: [
      "Haru riding bicycle to work, calm morning expression.",
      "Stopped beside road, looking at flat tire, troubled face.",
      "Kneeling with small repair kit, focused expression.",
      "Walking bike along road toward city skyline, tired but okay.",
    ],
  },
  {
    setId: "blackout",
    cast: `${CHARACTERS.haru}\n${CHARACTERS.ren}\n${CHARACTERS.taku}\nThree young adult roommates sharing an apartment.`,
    panels: [
      "Evening apartment: Haru reading on sofa, Ren at table, Taku playing cards — lamp lit.",
      "Sudden darkness, all three surprised faces in moonlight from window.",
      "Haru lighting candle, Ren with phone flashlight, calm teamwork.",
      "Three sitting on floor playing cards by candlelight, relaxed small smiles.",
    ],
  },
  {
    setId: "cooking-disaster",
    cast: CHARACTERS.ren,
    panels: [
      "Ren happily cooking at stove, stirring pot.",
      "Smoke rising from burnt pan, Ren shocked stiff expression.",
      "Ren on stool waving towel at ceiling alarm, stressed.",
      "Ren sitting with takeout pizza box, awkward relieved half-smile, messy kitchen behind.",
    ],
  },
  {
    setId: "dog-escape",
    cast: `${CHARACTERS.mei}\nSimple small dog with floppy ears (Mei's pet).`,
    panels: [
      "Mei opening apartment door, dog waiting eagerly.",
      "Dog dashing outside, Mei reaching surprised.",
      "Mei searching in small park area, calling dog worried.",
      "Mei kneeling hugging dog at building entrance, relieved smile.",
    ],
  },
  {
    setId: "lost-tourist",
    cast: `${CHARACTERS.taku}\nTaku wearing baseball cap, backpack on.`,
    panels: [
      "Taku on street holding phone map, confused look.",
      "Taku asking shop staff for directions, both gesturing.",
      "Taku walking uncertainly down side street.",
      "Taku smiling relieved near simple landmark fountain.",
    ],
  },
  {
    setId: "lost-wallet",
    cast: CHARACTERS.haru,
    panels: [
      "Haru at cafe table reaching for wallet to pay.",
      "Searching bag and pockets, growing panic expression.",
      "Outside bending to look under bench.",
      "Finding wallet under cafe table, huge relieved exhale smile.",
    ],
  },
  {
    setId: "missed-bus",
    cast: CHARACTERS.haru,
    panels: [
      "Haru waking in bed shocked, alarm on nightstand.",
      "Haru running with coffee cup, hurried expression.",
      "At bus stop as bus leaves, arm outstretched.",
      "Entering office building entrance, exhausted slump.",
    ],
  },
  {
    setId: "moving-day",
    cast: `${CHARACTERS.haru}\n${CHARACTERS.mei}`,
    panels: [
      "New apartment full of stacked boxes, Haru and Mei overwhelmed sigh.",
      "Both carrying couch up stairs, straining effort faces.",
      "Box dropped on floor, both shocked open mouths.",
      "Sitting on couch among boxes sharing pizza, tired happy smiles.",
    ],
  },
  {
    setId: "rain-surprise",
    cast: `${CHARACTERS.haru}\n${CHARACTERS.mei}`,
    panels: [
      "Haru and Mei picnic on blanket, pleasant smiles.",
      "Sudden rain, both look up surprised.",
      "Running together under one small umbrella.",
      "Under shop awning sharing warm drink, wet hair, laughing.",
    ],
  },
  {
    setId: "surprise-birthday",
    cast: `${CHARACTERS.mei}\n${CHARACTERS.ren}\n${CHARACTERS.taku}\nMei is the birthday person. Ren and Taku plan the surprise.`,
    panels: [
      "Ren and Taku hiding behind sofa, quiet excited faces.",
      "Mei opening front door with grocery bag, unaware.",
      "Lights on, Ren and Taku jumping out, Mei shocked happy.",
      "Three around small cake on table, warm celebration smiles.",
    ],
  },
];

/** @deprecated Use STORY_ESSAY_CHIBI_PROMPT */
export const STORY_KIRARA_PROMPT = STORY_ESSAY_CHIBI_PROMPT;

/** @deprecated Use STORY_ESSAY_CHIBI_PROMPT */
export const STORY_REFERENCE_MANGA_PROMPT = STORY_ESSAY_CHIBI_PROMPT;
