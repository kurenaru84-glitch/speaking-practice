/**
 * Story sets 11–20 — DRAFT plots for user review before image generation.
 * Style: locked Style C (reference-style-blackout.png). Elena / Marco / Leo as needed.
 */

import type { StoryStripPlot } from "./story-art-style";
import { CHARACTERS } from "./story-art-style";

export const STORY_PLOTS_11_20: StoryStripPlot[] = [
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
    setId: "power-bank",
    cast: CHARACTERS.elena,
    accents: "Red low-battery icon panel 1. Black dead screen panel 2. Blue power bank accent panels 3–4.",
    panels: [
      "Elena on European street using phone, red low-battery warning on screen, slight worry.",
      "Same street: phone screen completely black dead battery, Elena staring at phone troubled face.",
      "Elena at small electronics/phone shop counter buying blue portable power bank, paying cashier.",
      "Elena sitting on bench, phone plugged into SAME blue power bank charging, screen lit again, relieved smile.",
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
    setId: "pharmacy-cold",
    cast: CHARACTERS.elena,
    accents: "Green pharmacy cross sign. Orange medicine box accent.",
    panels: [
      "Elena walking on European street sneezing, hand near mouth, not feeling well.",
      "Elena entering pharmacy with green cross sign above door.",
      "Elena at pharmacy counter buying orange medicine box/cough drops, pharmacist handing bag.",
      "Elena at home on sofa with warm drink and medicine, small relieved smile, feeling better.",
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

/** @deprecated Use STORY_PLOTS_11_20 */
export const STORY_PLOTS_DRAFT_11_20 = STORY_PLOTS_11_20;
