/**
 * PicSpeak story-panel art style — rough doodle line art with a blended casual-comic feel.
 * Essence of loose diary/webcomic sketch (~30%) mixed with original ESL-app illustration.
 * Do not aim to replicate any single artist or series.
 */
export const STORY_PANEL_STYLE_PROMPT = `
MANDATORY ART STYLE — use IDENTICALLY in every image for cross-story consistency:

Line work: ROUGH hand-drawn doodle pen lines — uneven, sketchy, authentic, slightly wobbly. NOT clean vector, NOT polished digital art, NOT anime, NOT Ghibli, NOT picture-book painting.

UNIFIED CHARACTER DESIGN (same face/body template in EVERY panel and EVERY story):
- Round head
- Large EMPTY white circle eyes with thin black outline, NO pupils, NO highlights — eyes should be big and readable
- LARGE clear expressive mouth and eyebrows — exaggerate emotion so feelings read instantly (wide open O for shock, big smile arc, wavy line for worry). Expression is the focus.
- Hair: slightly rough messy sketch outline, short-to-medium length, a few loose strokes — NOT neat salon hair, NOT ultra-scribble chaos
- Simple body: thin sketchy limbs, small rounded hands, plain short-sleeve shirt and pants (add one obvious prop like cap, apron, or helmet only when the story requires it — face template stays the same)

Color: mostly black rough lines on white. Optional ONE small flat accent on a key object per panel (muted red, blue, or yellow). No gradients, no shading.

Background: minimal — a few sketch lines for setting. Props drawn simply.

Blend tone: casual diary webcomic sketch energy (~30%) mixed with simple original language-app illustration — NOT a copy of any specific comic, character, or series.

Layout: single square image, 2x2 grid, four equal panels, white gutters. Circled numbers 1, 2, 3, 4 in top-left of each panel. No speech bubbles, no text except numbers, no watermarks.
`.trim();

export type StoryStripPlot = {
  setId: string;
  character: string;
  panels: [string, string, string, string];
};

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

const UNIFIED_FACE =
  "Use the UNIFIED CHARACTER DESIGN above — large empty circle eyes, large expressive mouth, slightly rough hair, rough pen lines.";

export const STORY_PLOTS: StoryStripPlot[] = [
  {
    setId: "missed-bus",
    character: `SAME protagonist in all four panels. ${UNIFIED_FACE}`,
    panels: [
      "Wakes up with HUGE shocked open mouth, alarm clock ringing on nightstand (small red accent on clock).",
      "Running frantically, big panicked expression, coffee cup in hand.",
      "At bus stop, bus driving away, arm stretched out, mouth open yelling.",
      "Slumping through building door, tired defeated expression.",
    ],
  },
  {
    setId: "lost-tourist",
    character: `SAME protagonist wearing simple cap and backpack. ${UNIFIED_FACE}`,
    panels: [
      "Holding unfolded map, confused wavy mouth, looking around.",
      "Asking passerby directions, both with animated gesturing arms.",
      "Walking wrong way, worried eyebrows, uncertain mouth.",
      "Big happy smile at simple fountain landmark, relieved pose.",
    ],
  },
  {
    setId: "rain-surprise",
    character: `SAME two friends — identical face template, distinguish by ponytail vs short rough hair only. ${UNIFIED_FACE}`,
    panels: [
      "Picnic on blanket, big cheerful smiles, simple sun.",
      "Rain lines, both look up with surprised wide-open eyes and O mouths.",
      "Running under tiny umbrella, scared/excited big expressions.",
      "Under awning, wet hair strokes, laughing big smiles sharing drink.",
    ],
  },
  {
    setId: "dog-escape",
    character: `SAME person and simple sketch dog with floppy ears. ${UNIFIED_FACE}`,
    panels: [
      "Opening door, dog tail wagging, person smiling.",
      "Dog bolting out, person wide shocked eyes and open mouth reaching.",
      "In park calling dog, hands cupped around mouth, worried face.",
      "Hugging dog at gate, eyes closed happy big smile.",
    ],
  },
  {
    setId: "cooking-disaster",
    character: `SAME protagonist in sketchy apron over shirt. ${UNIFIED_FACE}`,
    panels: [
      "Stirring pot, content medium smile.",
      "Pot overflowing, HUGE panicked open mouth, smoke scribbles rising.",
      "On tiptoe waving cloth at smoke alarm, stressed expression.",
      "Messy counter, holding pizza box, awkward sheepish half-smile.",
    ],
  },
  {
    setId: "surprise-birthday",
    character: `SAME friend group — all identical face template, vary hair length only. ${UNIFIED_FACE}`,
    panels: [
      "Hiding behind sofa, finger on lips, playful big eyes.",
      "Birthday person opening door, neutral curious expression with bag.",
      "Lights on, everyone jumping with HUGE surprised happy open mouths.",
      "Around table with cake, big grins, arms raised celebration.",
    ],
  },
  {
    setId: "moving-day",
    character: `SAME two people moving — identical face template. ${UNIFIED_FACE}`,
    panels: [
      "Room full of sketch box squares, overwhelmed big sigh expression.",
      "Carrying couch upstairs, straining gritted-teeth exaggerated effort faces.",
      "Box dropped, items spill, both shocked wide O mouths.",
      "Collapsed on couch among boxes eating pizza, tired but big relieved smile.",
    ],
  },
  {
    setId: "bike-flat",
    character: `SAME cyclist with simple helmet, rough hair peeking out. ${UNIFIED_FACE}`,
    panels: [
      "Riding bike happily, big wind-in-hair smile.",
      "Stopped, looking down at flat tire, sad wobble mouth.",
      "Kneeling fixing chain, tongue-out concentrating face.",
      "Walking bike at sunset, calm small smile, tired eyes.",
    ],
  },
  {
    setId: "blackout",
    character: `SAME parent and two kids — kids use same face template but smaller. ${UNIFIED_FACE}`,
    panels: [
      "Living room lamp on, reading and playing, calm happy faces.",
      "Sudden darkness, all three wide white circle eyes and shocked O mouths.",
      "Lighting candles and flashlight, curious wondering expressions.",
      "Playing cards by candlelight, big cozy smiles.",
    ],
  },
  {
    setId: "lost-wallet",
    character: `SAME protagonist at cafe table. ${UNIFIED_FACE}`,
    panels: [
      "Patting pockets at cafe table, starting to look concerned.",
      "Digging through bag frantically, BIG panicked open mouth.",
      "Outside looking under bench, worried searching face.",
      "Finding wallet under table, HUGE relieved grin, shoulders dropped.",
    ],
  },
];
