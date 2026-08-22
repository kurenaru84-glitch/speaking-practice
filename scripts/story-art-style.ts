/**
 * PicSpeak original story-panel art style.
 * Simple unified line art — NOT based on or imitating any existing comic / artist.
 */
export const STORY_PANEL_STYLE_PROMPT = `
MANDATORY ART STYLE — original simple line-art illustration for a language-learning app. Use the SAME visual rules in every image:

Line work: clean medium-thin black outlines, evenly weighted, soft rounded corners. Hand-drawn feel but neat and consistent — not scratchy, not messy scribbles.

Original character design (do NOT imitate Sarah's Scribbles or any known webcomic):
- Round soft face shape (slightly wider chin, gentle curve)
- Eyes: small solid dot eyes with a tiny white highlight speck (NOT large empty circles, NOT anime eyes)
- Eyebrows: one short curved stroke above each eye
- Nose: optional tiny dot or omitted
- Mouth: small gentle curve or soft "o" shape
- Hair: simple smooth silhouette with clean outline — side part or short bob, NO jagged messy scribble hair
- Body: rounded torso, simple arms and legs, mitten-like rounded hands
- Default outfit: plain crew-neck shirt and simple pants (adjust only when story needs a clear prop like helmet or apron — keep same face template)

Color: mostly black lines on white. Optional ONE muted flat accent color per panel on a key object only (soft blue, soft coral, or soft green — never loud saturation). No gradients, no gray shading, no anime, no Ghibli, no Nordic picture book, no polished digital painting.

Background: very sparse — a few lines for floor, wall, or horizon. Props as simple geometric shapes.

Layout: single square image, 2x2 grid of four equal panels with white gutters. Each panel has a simple circled number 1, 2, 3, or 4 in the top-left corner. No speech bubbles, no captions except panel numbers, no watermarks, no logos.
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

export const STORY_PLOTS: StoryStripPlot[] = [
  {
    setId: "missed-bus",
    character:
      "SAME protagonist throughout: round face, dot eyes with highlight, side-part smooth hair, crew-neck shirt and pants.",
    panels: [
      "Wakes up surprised in bed, alarm clock on nightstand ringing.",
      "Running hurriedly along a simple street.",
      "At bus stop as bus drives away, one hand raised.",
      "Walking into building entrance looking tired.",
    ],
  },
  {
    setId: "lost-tourist",
    character:
      "SAME protagonist with baseball cap and small backpack — same round face and dot-eye design as other stories.",
    panels: [
      "Standing on street, unfolded map, confused expression.",
      "Asking passerby for directions, both gesturing simply.",
      "Walking down narrow path looking uncertain.",
      "Smiling beside a simple fountain statue landmark.",
    ],
  },
  {
    setId: "rain-surprise",
    character: "SAME two friends — identical face template, one with ponytail, one with short side-part hair.",
    panels: [
      "Picnic blanket on grass under simple sun symbol.",
      "Rain lines falling, both look up surprised.",
      "Running together under one small umbrella.",
      "Under shop awning, sharing warm drink, smiling.",
    ],
  },
  {
    setId: "dog-escape",
    character: "SAME person and small round simple dog with floppy ears — person uses standard face template.",
    panels: [
      "Opening front door, dog waiting happily.",
      "Dog runs outside, person reaching out surprised.",
      "Walking through simple park trees calling dog.",
      "Kneeling to hug dog at gate, relieved smile.",
    ],
  },
  {
    setId: "cooking-disaster",
    character: "SAME protagonist in apron over crew-neck shirt, standard round face design.",
    panels: [
      "Stirring pot on stove, content expression.",
      "Pot boiling over, wavy smoke lines, worried face.",
      "Standing on chair waving cloth at ceiling alarm.",
      "Messy counter, holding pizza box, awkward smile.",
    ],
  },
  {
    setId: "surprise-birthday",
    character: "SAME friend group — all use identical round-face dot-eye template, varied hair only.",
    panels: [
      "People hiding behind sofa, finger to lips.",
      "Birthday person opening door with paper bag.",
      "Lights on, friends stepping out with happy poses.",
      "Table with simple cake, everyone smiling together.",
    ],
  },
  {
    setId: "moving-day",
    character: "SAME two people — standard face template, one ponytail one side-part hair.",
    panels: [
      "Room filled with stacked box shapes.",
      "Carrying sofa up stairs together, straining.",
      "Dropped box, books and lamp on floor, surprised faces.",
      "Sitting on sofa among boxes eating pizza slice.",
    ],
  },
  {
    setId: "bike-flat",
    character: "SAME cyclist — standard face template with simple bike helmet.",
    panels: [
      "Riding bicycle on road with simple cloud lines.",
      "Stopped, looking at flat front tire.",
      "Kneeling with small tool beside bicycle chain.",
      "Walking bike along road toward simple horizon line.",
    ],
  },
  {
    setId: "blackout",
    character: "SAME parent and two children — all same round-face design, children slightly shorter.",
    panels: [
      "Living room, reading book and board game, lamp lit.",
      "Room dark, surprised faces lit by window moon.",
      "Lighting candles and flashlight on wall.",
      "Playing cards at table by candlelight, smiling.",
    ],
  },
  {
    setId: "lost-wallet",
    character: "SAME protagonist at outdoor cafe table — standard round face, side-part hair.",
    panels: [
      "Hand reaching into pocket at cafe table to pay.",
      "Checking empty pockets and bag, worried expression.",
      "Looking under park bench on sidewalk.",
      "Finding wallet under table, relieved smile, waiter nearby.",
    ],
  },
];
