"use client";

import { IconSpeaker } from "@/components/icons";
import { useSpeech } from "@/lib/use-speech";

type Props = {
  text: string;
  languageId: string;
  speakId: string;
  label?: string;
  className?: string;
};

export function SpeakButton({ text, languageId, speakId, label = "読み上げ", className = "" }: Props) {
  const { speak, stop, speakingId, supported } = useSpeech();
  const active = speakingId === speakId;

  if (!supported) return null;

  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 ${className}`}
      onClick={() => (active ? stop() : speak(text, languageId, speakId))}
      aria-label={active ? `${label}を停止` : label}
      title={active ? "停止" : label}
    >
      <IconSpeaker className={`h-4 w-4 ${active ? "text-amber-700" : ""}`} />
      <span>{active ? "停止" : "聞く"}</span>
    </button>
  );
}
