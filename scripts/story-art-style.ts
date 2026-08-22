/**
 * Fixed art-style block for all story 4-panel strips.
 * Keep this identical across every GenerateImage call so panels stay visually consistent.
 *
 * Reference look: missed-bus (story 7) — thin pen line art, Sarah's Scribbles simplicity.
 */
export const STORY_PANEL_STYLE_PROMPT = `
MANDATORY ART STYLE — use exactly the same look in every image:
Minimal hand-drawn webcomic line art like Sarah's Scribbles. Thin black pen outlines on pure white background, slightly sketchy imperfect strokes. Characters always drawn the same way: large empty circle eyes with NO pupils, simple small oval mouth, messy shaggy hair with jagged outline. Plain short-sleeve t-shirt and simple pants unless the story needs one obvious costume item (keep line style identical). Sparse background, basic geometric shapes only (bed, door, table as simple boxes/lines). Mostly black and white; optional ONE small flat accent color on a single key object in a panel (e.g. red alarm clock) — no full color fills on characters. NO gray shading, NO gradients, NO anime, NO Ghibli, NO Hilda, NO Nordic illustration, NO thick marker coloring-book lines, NO polished digital painting, NO 3D.

Layout: single square image, 2x2 grid of four equal panels with white gutters. Each panel has a hand-drawn circled number 1, 2, 3, or 4 in the top-left corner. No speech bubbles, no captions except panel numbers, no watermarks.
`.trim();

export type StoryStripPlot = {
  setId: string;
  character: string;
  panels: [string, string, string, string];
};

/** Build a full generation prompt for one story set. */
export function buildStoryStripPrompt(plot: StoryStripPlot): string {
  const [p1, p2, p3, p4] = plot.panels;
  return `${STORY_PANEL_STYLE_PROMPT}

${plot.character}

Panel 1 top-left (number 1): ${p1}
Panel 2 top-right (number 2): ${p2}
Panel 3 bottom-left (number 3): ${p3}
Panel 4 bottom-right (number 4): ${p4}
`;
}

export const STORY_PLOTS: StoryStripPlot[] = [
  {
    setId: "missed-bus",
    character: "SAME character: shaggy-haired person in plain t-shirt and pants.",
    panels: [
      "Wakes up shocked in bed, ringing alarm clock on nightstand.",
      "Running hurriedly on simple street lines.",
      "At bus stop, bus driving away, waving hand.",
      "Entering office building looking tired and late.",
    ],
  },
  {
    setId: "lost-tourist",
    character: "SAME character: tourist with cap and backpack, same face and line style as story style guide.",
    panels: [
      "Confused on street holding unfolded map.",
      "Asking local for directions, both gesturing.",
      "Walking down wrong alley looking worried.",
      "Smiling in front of simple town fountain landmark.",
    ],
  },
  {
    setId: "rain-surprise",
    character: "SAME two friends, both drawn with identical simple face style, t-shirts.",
    panels: [
      "Sunny picnic on blanket on grass.",
      "Rain lines falling, both look up surprised.",
      "Running together under one small umbrella.",
      "Under shop awning sharing drink, wet hair, smiling.",
    ],
  },
  {
    setId: "dog-escape",
    character: "SAME woman and small simple dog, same line art style throughout.",
    panels: [
      "Opening front door, dog waiting excitedly.",
      "Dog runs out into yard, woman reaches surprised.",
      "Searching in simple park with trees as lines.",
      "Hugging dog at garden gate, relieved.",
    ],
  },
  {
    setId: "cooking-disaster",
    character: "SAME person in apron over t-shirt, same face style.",
    panels: [
      "Happily stirring pot on stove.",
      "Pot boiling over, smoke scribble lines rising.",
      "Waving towel at ceiling smoke alarm.",
      "Messy kitchen, holding pizza box awkward smile.",
    ],
  },
  {
    setId: "surprise-birthday",
    character: "SAME simple drawn friends, identical face style for all people.",
    panels: [
      "Friends hiding behind sofa in dark room.",
      "Birthday person opening door carrying bag.",
      "Light on, friends jumping out hands up.",
      "Cake on table, group smiling around it.",
    ],
  },
  {
    setId: "moving-day",
    character: "SAME two people moving, identical simple character design.",
    panels: [
      "Room full of simple box squares stacked.",
      "Carrying couch up staircase together straining.",
      "Box fell, lamp and books spilled on floor.",
      "Sitting on couch among boxes eating pizza.",
    ],
  },
  {
    setId: "bike-flat",
    character: "SAME cyclist with helmet, same shaggy-hair face style.",
    panels: [
      "Riding bicycle on simple road with cloud lines.",
      "Stopped, flat front tire, looking down sad.",
      "Kneeling fixing bicycle chain with tiny tools.",
      "Walking bike along road at simple sunset line.",
    ],
  },
  {
    setId: "blackout",
    character: "SAME parent and two kids, all same simple face design.",
    panels: [
      "Evening living room, reading and board game, lamp on.",
      "All lights off, dark, surprised faces.",
      "Lighting candles and flashlight on wall.",
      "Playing cards on table by candlelight smiling.",
    ],
  },
  {
    setId: "lost-wallet",
    character: "SAME person at cafe, same shaggy hair and t-shirt style.",
    panels: [
      "Reaching for wallet to pay at cafe table.",
      "Empty pockets, searching bag panicked.",
      "Looking under bench on sidewalk outside.",
      "Found wallet under cafe table, relieved smile.",
    ],
  },
];
