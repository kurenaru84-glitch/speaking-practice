import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseImageUrl } from "../src/lib/images";
import { listAllSceneDescriptionTargets } from "../src/lib/scene-description-targets";
import type { SceneDescriptionEntry } from "../src/lib/scene-descriptions";

const OUT_PATH = path.join(process.cwd(), "src/data/scene-descriptions.json");
const MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function loadApiKey() {
  const fromEnv = process.env.GEMINI_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  const raw = require("node:fs").readFileSync(path.join(process.cwd(), ".env.local"), "utf8") as string;
  for (const line of raw.split("\n")) {
    const match = line.match(/^GEMINI_API_KEY=(.+)$/);
    if (match) return match[1].trim();
  }
  throw new Error("GEMINI_API_KEY が見つかりません。");
}

function patternForUrl(imageUrl: string): SceneDescriptionEntry["patternId"] {
  if (imageUrl.startsWith("/images/speculate/")) return "speculate";
  if (imageUrl.startsWith("/images/roleplay/")) return "roleplay";
  return "describe";
}

function promptForPattern(patternId: SceneDescriptionEntry["patternId"]) {
  const base = `You are writing a factual scene reference for a language-learning app tutor (English).
Describe ONLY what is visible. Include:
- Setting / location
- People: count, apparent roles, left-to-right and foreground/background positions, facing direction
- Appearance and clothing (describe colors conservatively, e.g. brown/tan/beige rather than yellow unless clearly yellow)
- Actions, expressions, and interactions
- Key objects and background details
- A short "Spatial layout" line (e.g. "Left: ... Center: ... Right: ...")

Write 180-280 words in clear English. No markdown headings. No speculation beyond mild visible cues.`;

  if (patternId === "speculate") {
    return `${base}

This photo is for a "speculate" task (why / before / next). Mention visible clues that could support reasonable guesses, but label them as visible evidence only.`;
  }
  if (patternId === "roleplay") {
    return `${base}

This photo is for role-play / advice. Note who the learner might speak to and the social situation.`;
  }
  return `${base}

This photo is for a "describe the scene" speaking task.`;
}

async function captionImage(apiKey: string, imageUrl: string, patternId: SceneDescriptionEntry["patternId"]) {
  const folder = patternId === "describe" ? "describe" : patternId === "speculate" ? "speculate" : "roleplay";
  const parsed = parseImageUrl(imageUrl, folder);
  const buffer = await readFile(parsed.fullPath);
  const body = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: parsed.mimeType,
              data: buffer.toString("base64"),
            },
          },
          { text: promptForPattern(patternId) },
        ],
      },
    ],
    generationConfig: {
      thinkingConfig: { thinkingLevel: "minimal" },
    },
  };

  const url = `${API_BASE}/${MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    error?: { message?: string };
  };
  if (!res.ok) throw new Error(data.error?.message ?? `API error ${res.status}`);
  const text =
    data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim() ?? "";
  if (!text) throw new Error("Empty caption response");
  return text;
}

async function main() {
  const apiKey = loadApiKey();
  const force = process.argv.includes("--force");
  const targets = await listAllSceneDescriptionTargets();

  let existing: SceneDescriptionEntry[] = [];
  try {
    existing = JSON.parse(await readFile(OUT_PATH, "utf8")) as SceneDescriptionEntry[];
  } catch {
    existing = [];
  }

  const map = new Map(existing.map((entry) => [entry.imageUrl, entry]));

  for (const imageUrl of targets.all) {
    if (map.has(imageUrl) && !force) {
      console.log(`Skip (exists): ${imageUrl}`);
      continue;
    }
    const patternId = patternForUrl(imageUrl);
    console.log(`Caption: ${imageUrl}`);
    try {
      const descriptionEn = await captionImage(apiKey, imageUrl, patternId);
      map.set(imageUrl, { imageUrl, patternId, descriptionEn });
      await writeFile(OUT_PATH, `${JSON.stringify([...map.values()], null, 2)}\n`, "utf8");
      await new Promise((r) => setTimeout(r, 2500));
    } catch (error) {
      console.error(`Failed: ${imageUrl}`, error);
      throw error;
    }
  }

  console.log(`Wrote ${map.size} entries to ${OUT_PATH}`);
}

void main();
