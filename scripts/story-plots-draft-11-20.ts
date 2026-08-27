/**
 * Story sets 11–20 — DRAFT plots for user review before image generation.
 * Style: locked Style C (reference-style-blackout.png). Elena / Marco / Leo as needed.
 */

import type { StoryStripPlot } from "./story-art-style";
import { CHARACTERS } from "./story-art-style";

export const STORY_PLOTS_DRAFT_11_20: StoryStripPlot[] = [
  {
    setId: "locked-out",
    cast: CHARACTERS.elena,
    accents: "Yellow door number or key accent in panel 4.",
    panels: [
      "Elena outside apartment door, hand on handle, door locked. Shoulder bag on. Realizes keys not in hand.",
      "Same doorway: Elena searching shoulder bag and coat pockets, worried face. Door still closed.",
      "Same doorway: Elena lifting small doormat, finding spare key underneath, small relieved smile.",
      "Same doorway: Elena unlocking door with key, door opening, relieved happy face entering.",
    ],
  },
  {
    setId: "wrong-platform",
    cast: CHARACTERS.marco,
    accents: "Yellow train accent. Blue platform sign accent.",
    panels: [
      "Marco on European train platform, checking blue platform sign, train arriving.",
      "Marco on train looking out window, suddenly worried — wrong scenery, wrong direction.",
      "Marco rushing down train stairs at station, yellow train visible leaving on other track.",
      "Marco on correct platform, correct yellow train stopped, boarding with relieved smile.",
    ],
  },
  {
    setId: "coffee-spill",
    cast: CHARACTERS.elena,
    accents: "Brown coffee accent. White napkin stack.",
    panels: [
      "Elena at café table with coffee cup, reaching for sugar, calm smile.",
      "Same table: Elena bumped cup, brown coffee spilled on table and sleeve, shocked O mouth.",
      "Same table: Elena wiping spill with napkins, embarrassed expression, barista handing more napkins.",
      "Same table: Elena with fresh new coffee cup, small awkward relieved smile.",
    ],
  },
  {
    setId: "wrong-package",
    cast: `${CHARACTERS.marco}\n${CHARACTERS.leo}`,
    accents: "Brown cardboard box accent.",
    panels: [
      "Marco at apartment door holding brown delivery box, checking label, confused.",
      "Leo from next door pointing at box — wrong name on label, not Marco's package.",
      "Marco handing box to Leo, Leo receiving happily — swap complete.",
      "Both smiling, Leo carrying box into his door, Marco waving goodbye.",
    ],
  },
  {
    setId: "dead-phone",
    cast: CHARACTERS.elena,
    accents: "Blue phone screen panel 1 only. Black blank screen panel 2.",
    panels: [
      "Elena on European street following blue map on phone, walking confidently.",
      "Same street: phone screen black/dead battery, Elena staring at phone worried.",
      "Elena asking simple passerby stick figure for directions, both gesturing.",
      "Elena smiling relieved near correct shop/landmark she was looking for.",
    ],
  },
  {
    setId: "elevator-stuck",
    cast: `${CHARACTERS.elena}\n${CHARACTERS.marco}`,
    accents: "Red emergency button accent panel 3.",
    panels: [
      "Elena and Marco entering elevator together, doors closing, small talk smiles.",
      "Same elevator stopped: both surprised faces, lights dim, elevator not moving.",
      "Same elevator: Marco pressing red emergency button, Elena waiting calmly.",
      "Elevator doors open on floor, both stepping out relieved, smiling.",
    ],
  },
  {
    setId: "farmers-market",
    cast: CHARACTERS.marco,
    accents: "Red apple accent. Green vegetable accent.",
    panels: [
      "Marco at outdoor European market stall, looking at red apples, happy.",
      "Marco holding apple, vendor weighing on scale, Marco nodding.",
      "Marco paying cash to vendor, taking paper bag of apples.",
      "Marco walking away from market with bag, biting apple, satisfied smile.",
    ],
  },
  {
    setId: "windy-umbrella",
    cast: CHARACTERS.elena,
    accents: "Yellow umbrella accent. Blue wind lines panel 2.",
    panels: [
      "Elena walking on European street with yellow umbrella, windy but fine.",
      "Strong blue wind lines, yellow umbrella blown inside-out, Elena struggling surprised.",
      "Elena closing broken umbrella, hair messy, walking on without it.",
      "Elena under café awning drinking hot drink, hair still messy, laughing at herself.",
    ],
  },
  {
    setId: "ice-cream-drop",
    cast: `${CHARACTERS.elena}\n${CHARACTERS.leo}`,
    accents: "Pink ice cream scoop accent.",
    panels: [
      "Elena and Leo walking in plaza, Leo holding pink ice cream cone happily.",
      "Leo's pink ice cream dropped on ground, Leo devastated sad face, Elena sympathetic.",
      "Elena at ice cream shop counter buying new cone for Leo.",
      "Leo holding new pink ice cream cone, big smile, Elena smiling beside him.",
    ],
  },
  {
    setId: "photo-request",
    cast: `${CHARACTERS.elena}\n${CHARACTERS.marco}`,
    accents: "Simple camera/phone screen accent.",
    panels: [
      "Elena and Marco at European landmark plaza, tourist stick figure approaching them gesturing.",
      "Marco taking photo of tourist couple with phone, Elena waiting beside.",
      "Tourist couple thanking them, gesturing — now your turn, we'll take yours.",
      "Tourist taking photo of Elena and Marco together smiling in front of landmark.",
    ],
  },
];

/** Human-readable index for review */
export const STORY_DRAFT_11_20_SUMMARY = STORY_PLOTS_DRAFT_11_20.map((p, i) => ({
  number: i + 11,
  setId: p.setId,
  cast: p.cast.includes("Leo") ? (p.cast.includes("Marco") && p.cast.includes("elena") ? "Elena+Marco" : p.cast.includes("Marco") ? "Marco+Leo" : "Elena+Leo") : p.cast.includes("Marco") ? (p.cast.includes("elena") ? "Elena+Marco" : "Marco") : "Elena",
  panels: p.panels,
}));
